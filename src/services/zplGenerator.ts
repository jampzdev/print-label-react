import { LabelData, LabelDimensions, LabelElement } from '../types';
import { getZplFormat } from './zplFormats';

export const generateZplFromElements = async(
  elements: LabelElement[],
  dimensions: LabelDimensions,
  labelData: LabelData,
  labelType : string
): Promise<string> => {
  // Convert dimensions from inches to dots (203 dpi)

  
  const widthDots = Math.round(dimensions.width * 203);
  const heightDots = Math.round(dimensions.height * 203);

  // Start ZPL code

  let zpl = await getZplFormat(labelData,labelData.labelType.type_name,labelType)
//   let zpl = `^XA
// ^PW${widthDots}
// ^LL${heightDots}
// ^LH0,0
// ^CI28\n`;

  // Add elements based on their positions
  return zpl;
};

export const generateZplCode = async (
  labelData: LabelData
): Promise<{ zpl: string; elements: LabelElement[] }> => {
  const dpi = 203;

  const dimensions = {
    width: labelData.cartonWidth,
    height: labelData.cartonHeight
  };

  const labelWidthDots = dimensions.width * dpi;
  const labelHeightDots = dimensions.height * dpi;

  const fontWidthDots = 30;
  const title = labelData.modelName;
  const titleSize = 100;

  const titleWidth = title.length * titleSize;
  const titleHeight = titleSize;

  const xPosition = Math.floor((labelWidthDots - titleWidth) / 2);
  const yPosition = Math.floor((labelHeightDots - titleHeight) / 2);

  const initialElements: LabelElement[] = [
    {
      id: 'modelName',
      type: 'text',
      content: title,
      position: { x: xPosition, y: yPosition },
      size: { width: titleSize, height: titleSize }
    },
    {
      id: 'brandName',
      type: 'text',
      content: labelData.brandName,
      position: { x: 50, y: yPosition + 120 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'serialNumber',
      type: 'text',
      content: `Serial Number: ${labelData.serialNumber}`,
      position: { x: 50, y: yPosition + 160 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'dimensions',
      type: 'text',
      content: `Dimensions: ${labelData.cartonHeight}"H x ${labelData.cartonWidth}"W x ${labelData.cartonDepth}"D`,
      position: { x: 50, y: yPosition + 200 },
      size: { width: fontWidthDots, height: fontWidthDots }
    },
    {
      id: 'barcode',
      type: 'barcode',
      content: labelData.serialNumber,
      position: { x: 50, y: yPosition + 250 },
      size: { width: 2, height: 100 }
    }
  ];

  const zpl = await generateZplFromElements(initialElements, dimensions, labelData, 'front');

  return {
    zpl,
    elements: initialElements
  };
};


export const convertMillimeterToInches = (value: number): number => {
  const inches = value / 25.4;
  return inches;
};