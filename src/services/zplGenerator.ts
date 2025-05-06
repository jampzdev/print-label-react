import { LabelData, LabelDimensions, LabelElement } from '../types';
import { getZplFormat } from './zplFormats';

export const generateZplFromElements = (
  elements: LabelElement[],
  dimensions: LabelDimensions,
  labelData: LabelData,
  labelType : string
): string => {
  // Convert dimensions from inches to dots (203 dpi)

  
  const widthDots = Math.round(dimensions.width * 203);
  const heightDots = Math.round(dimensions.height * 203);

  // Start ZPL code

  let zpl = getZplFormat(labelData,labelData.labelType.type_name,labelType)
//   let zpl = `^XA
// ^PW${widthDots}
// ^LL${heightDots}
// ^LH0,0
// ^CI28\n`;

  // Add elements based on their positions
  return zpl;
};

export const generateZplCode = (
  labelData: LabelData
): { zpl: string; elements: LabelElement[] } => {
  console.log("gago",labelData)
  const dimensions = { width: labelData.cartonWidth, height: labelData.cartonHeight } 

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

  const zpl = generateZplFromElements(initialElements, dimensions, labelData,'front');

  return {
    zpl,
    elements: initialElements
  };
};

export const convertMillimeterToInches = (value: number): number => {
  const inches = value / 25.4;
  return inches;
};