export async function imagePathToZpl(filePath: string): Promise<string> {
    const img = new Image();
    img.src = filePath;
    img.crossOrigin = 'Anonymous';
  
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load.'));
    });
  
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
  
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    const binaryData: string[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const avg = (r + g + b) / 3;
        binaryData.push(avg < 128 ? '1' : '0');
    }
  
    const bytesPerRow = Math.ceil(canvas.width / 8);
    const totalBytes = bytesPerRow * canvas.height;
    const zplBytes: string[] = [];
  
    for (let row = 0; row < canvas.height; row++) {
        for (let byte = 0; byte < bytesPerRow; byte++) {
            let byteStr = '';
            for (let bit = 0; bit < 8; bit++) {
                const x = byte * 8 + bit;
                const idx = row * canvas.width + x;
                byteStr += binaryData[idx] ?? '0';
            }
            zplBytes.push(parseInt(byteStr, 2).toString(16).padStart(2, '0').toUpperCase());
        }
    }
  
    return `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${zplBytes.join('')}`;
}
