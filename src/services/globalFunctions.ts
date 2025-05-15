import { toCanvas } from 'html-to-image';

export function inchesToMillimeters(inches: number): number {
    return Math.round(inches * 25.4);
}

export function millimeterToPixels(mm: number): number {
    let dpi = 300;
    return Math.round((mm / 25.4)*dpi);
}

export async function base64ToZpl(base64: string): Promise<string> {
    // Create an image element to load the base64 data
    const image = new Image();
    image.src = base64;

    // Wait for the image to load
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (error) => {
            console.error("Error loading image:", error);
            reject(error);
        };
    });

    // Ensure image loaded properly
    if (image.width === 0 || image.height === 0) {
        throw new Error('Image failed to load or has invalid dimensions');
    }

    console.log(`Image loaded: Width = ${image.width}, Height = ${image.height}`);

    // Create a canvas to draw the image onto and get the image data
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context is not available');
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);

    // Get image data (rgba)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Log image data for debugging
    console.log('Image data length:', imgData.length);
    console.log('Sample image data (first 10 pixels):', imgData.slice(0, 40));

    // Initialize the ZPL data as a string
    let hexData = '';
    let byte = 0;
    let bitCount = 0;

    // Iterate through the image data to convert it to monochrome (black and white)
    for (let i = 0; i < imgData.length; i += 4) {
        // Get the grayscale value (average of R, G, B channels)
        const grayscale = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
        const bit = grayscale < 128 ? 1 : 0;  // Black (1) or White (0)

        // Add the bit to the byte
        byte = (byte << 1) | bit;
        bitCount++;

        // If we've filled a byte (8 bits), add it to the hexData
        if (bitCount === 8) {
            hexData += byte.toString(16).padStart(2, '0').toUpperCase();
            byte = 0;  // Reset byte
            bitCount = 0;  // Reset bit count
        }
    }

    // If there are leftover bits (less than 8), shift them into the final byte
    if (bitCount > 0) {
        byte = byte << (8 - bitCount);
        hexData += byte.toString(16).padStart(2, '0').toUpperCase();
    }

    // Check if we generated any hex data
    if (!hexData) {
        throw new Error('No image data generated for ZPL');
    }

    console.log('Generated hex data (first 10 bytes):', hexData.slice(0, 20)); // Debug the first 10 bytes

    // Calculate the number of bytes and rows for ZPL
    const totalBytes = Math.ceil(canvas.width * canvas.height / 8);  // Total bytes for the image
    const bytesPerRow = Math.ceil(canvas.width / 8);  // Number of bytes per row
    const totalRows = canvas.height;  // Total rows of the image

    // Log the ZPL parameters
    console.log(`Total Bytes: ${totalBytes}, Bytes Per Row: ${bytesPerRow}, Total Rows: ${totalRows}`);

    // Generate the ZPL code
    const zplCode = `^XA\n^FO0,0\n^GFA,${totalBytes},${bytesPerRow},${totalRows},${hexData}\n^XZ`;

    // Log the ZPL output for debugging
    console.log('Generated ZPL:', zplCode);

    return zplCode;
}

export async function base64ToZplAndSave(base64: string, nickname: string): Promise<string> {
    try {
        // Convert base64 to Blob
        const blob = base64ToBlob(base64);
        
        // Create FormData and append fields
        const formData = new FormData();
        formData.append('image', blob, `${nickname}.png`); // the file field
        formData.append('nickname', nickname); // other fields

        // Send the request
        const response = await fetch('http://localhost:3001/api/save-image', {
            method: 'POST',
            body: formData, // No need to set Content-Type header; the browser sets it automatically
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save the image on the server: ${errorText}`);
        }

        const result = await response.json();
        console.log('Image saved at:', result.filePath);
        return result.filePath;
    } catch (error: any) {
        console.error('Error in saving image:', error);
        throw new Error(`Error while saving the image: ${error.message}`);
    }
}

function base64ToBlob(base64: string): Blob {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';

    const binary = atob(data);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
}

export async function toBmp(element: HTMLElement, options = {}): Promise<string> {
  const canvas = await toCanvas(element, options);
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const dv = new DataView(buffer);
  let p = 0;

  // BMP Header
  dv.setUint8(p++, 0x42); // B
  dv.setUint8(p++, 0x4D); // M
  dv.setUint32(p, fileSize, true); p += 4;
  p += 4; // Reserved
  dv.setUint32(p, 54, true); p += 4; // Pixel data offset

  // DIB Header
  dv.setUint32(p, 40, true); p += 4; // Header size
  dv.setInt32(p, width, true); p += 4;
  dv.setInt32(p, -height, true); p += 4; // top-down BMP
  dv.setUint16(p, 1, true); p += 2; // Planes
  dv.setUint16(p, 24, true); p += 2; // Bits per pixel
  dv.setUint32(p, 0, true); p += 4; // Compression
  dv.setUint32(p, pixelArraySize, true); p += 4;
  p += 16; // skip unused fields

  // Pixel data
  const data = imageData.data;
  const rowPadding = rowSize - width * 3;
  let i = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = data[i++];
      const g = data[i++];
      const b = data[i++];
      i++; // skip alpha

      dv.setUint8(p++, b);
      dv.setUint8(p++, g);
      dv.setUint8(p++, r);
    }
    p += rowPadding;
  }

  const blob = new Blob([buffer], { type: 'image/bmp' });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob); // => returns base64 BMP
  });
}




  