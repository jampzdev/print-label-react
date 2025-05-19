export async function imagePathToZpl(
    filePath: string,
    targetDpi: number = 300,
    physicalWidthInInches: number = 6,
    maxPhysicalHeightInInches?: number,
    originalDpi: number = 96 // Source image DPI
  ): Promise<string> {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = filePath;
  
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load.'));
    });
  
    // Compute full label dimensions in dots
    const labelWidthDots = Math.floor(physicalWidthInInches * targetDpi);
    const labelHeightDots = maxPhysicalHeightInInches
      ? Math.floor(maxPhysicalHeightInInches * targetDpi)
      : Math.floor((img.height / originalDpi) * targetDpi);
  
    // Convert image physical size to dots at targetDpi
    const imgPhysicalWidthInches = img.width / originalDpi;
    const imgPhysicalHeightInches = img.height / originalDpi;
    const imgDotsWidth = imgPhysicalWidthInches * targetDpi;
    const imgDotsHeight = imgPhysicalHeightInches * targetDpi;
  
    // Scale image to fit within label size
    const widthScale = labelWidthDots / imgDotsWidth;
    const heightScale = labelHeightDots / imgDotsHeight;
    const scale = Math.min(widthScale, heightScale);
  
    const scaledWidth = Math.floor(imgDotsWidth * scale);
    const scaledHeight = Math.floor(imgDotsHeight * scale);
  
    const canvas = document.createElement('canvas');
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
  
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    const binaryData: string[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const avg = (r + g + b) / 3;
      binaryData.push(avg < 128 ? '1' : '0');
    }
  
    const bytesPerRow = Math.ceil(scaledWidth / 8);
    const totalBytes = bytesPerRow * scaledHeight;
    const zplBytes: string[] = [];
  
    for (let row = 0; row < scaledHeight; row++) {
      for (let byte = 0; byte < bytesPerRow; byte++) {
        let byteStr = '';
        for (let bit = 0; bit < 8; bit++) {
          const x = byte * 8 + bit;
          const idx = row * scaledWidth + x;
          byteStr += x < scaledWidth ? binaryData[idx] : '0';
        }
        zplBytes.push(parseInt(byteStr, 2).toString(16).padStart(2, '0').toUpperCase());
      }
    }
  
    // Center image on label
    const offsetX = Math.floor((labelWidthDots - scaledWidth) / 2);
    const offsetY = Math.floor((labelHeightDots - scaledHeight) / 2);
  
    return `^XA
  ^PW${labelWidthDots}
  ^LL${labelHeightDots}
  ^CI28
  ^FO0,0
  ^GFA,${totalBytes},${totalBytes},${bytesPerRow},${zplBytes.join('')}
  ^XZ`;
  }
  