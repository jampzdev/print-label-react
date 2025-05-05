import { LabelData, LabelDimensions, LabelElement } from '../types';

export const generateZplFromElements = (
  elements: LabelElement[],
  dimensions: LabelDimensions,
  labelData: LabelData
): string => {
  // Convert dimensions from inches to dots (203 dpi)
  const widthDots = Math.round(dimensions.width * 203);
  const heightDots = Math.round(dimensions.height * 203);

  // Start ZPL code
  let zpl = `^XA
^PW${widthDots}
^LL${heightDots}
^LH0,0
^CI28\n`;

  // Add elements based on their positions
  elements.forEach(element => {
    const { x, y } = element.position;
    const { width, height } = element.size || { width: 0, height: 0 };

    
    
    switch (element.type) {
      case 'text':
        console.log("wew",`^FO${x},${y}^A0N,${width},${height}^FD${element.content}^FS\n`)
        zpl += `^FO${x},${y}^A0N,${width},${height}^FD${element.content}^FS\n`;
        break;
      case 'barcode':
        zpl += `^FO${Math.round(x)},${Math.round(y)}^BY3
^BCN,100,Y,N,N
^FD${element.content}^FS\n`;
        break;
      case 'image':
        zpl += `^FO${Math.round(x)},${Math.round(y)}^GFA,2000,2000,20,,${element.content}^FS\n`;
        break;
    }
  });

  // Add images if they exist
  let currentY = 350;
  
  if (labelData.barcodeImage) {
    zpl += `^FO50,${currentY}^GFA,2000,2000,20,,${labelData.barcodeImage.name}^FS\n`;
    currentY += 100;
  }
  
  if (labelData.certificationsImage) {
    zpl += `^FO50,${currentY}^GFA,2000,2000,20,,${labelData.certificationsImage.name}^FS\n`;
    currentY += 100;
  }
  
  if (labelData.warningsImage) {
    zpl += `^FO50,${currentY}^GFA,2000,2000,20,,${labelData.warningsImage.name}^FS\n`;
    currentY += 100;
  }

  if (labelData.userManual) {
    zpl += `^FO50,${currentY}^A0N,20,20^FDUser Manual: ${labelData.userManual.name}^FS\n`;
  }

  // End ZPL code
  zpl += `^XZ`;
  
  return zpl;
};

export const generateZplCode = (
  labelData: LabelData
): { zpl: string; elements: LabelElement[] } => {
  const dimensions = labelData.labelType === 'front' 
    ? { width: 5.80, height: 4.58 } 
    : { width: 3.48, height: 6.03 };

  const dpi = 203;


  const labelWidthDots = dimensions.width * dpi; // Convert inches to dots
  const labelHeightDots = dimensions.height * dpi; // Convert inches to dots

  const fontWidthDots = 30;
  const title = labelData.modelName;
  const title_size = 100

  // Calculate width,height of the title
  const titleWidth = title.length * title_size;
  const titleHeight = title_size;

  const xPosition = Math.floor((labelWidthDots - titleWidth) / 2);
  const yPosition = Math.floor((labelHeightDots - titleHeight) / 2);


  const initialElements: LabelElement[] = [
    {
      id: 'modelName',
      type: 'text',
      content: title,
      position: { x: xPosition, y: yPosition },
      size: { width: title_size, height: title_size }
    },
    {
      id: 'brandName',
      type: 'text',
      content: labelData.brandName,
      position: { x: 50, y: 100 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'serialNumber',
      type: 'text',
      content: `Serial Number: ${labelData.serialNumber}`,
      position: { x: 50, y: 100 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'dimensions',
      type: 'text',
      content: `Dimensions: ${labelData.cartonHeight}"H x ${labelData.cartonWidth}"W x ${labelData.cartonDepth}"D`,
      position: { x: 50, y: 150 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'barcode',
      type: 'barcode',
      content: labelData.serialNumber,
      position: { x: 50, y: 200 },
      size: { width: fontWidthDots, height: fontWidthDots }
    }
  ];

  const zpl = generateZplFromElements(initialElements, dimensions, labelData);

  return {
    zpl,
    elements: initialElements
  };
};
