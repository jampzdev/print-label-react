import axios from 'axios';
import { LabelDimensions } from '../types';

/**
 * Generates a preview URL using the Labelary API
 */
export const generateZplPreviewUrl = async (
  zplCode: string, 
  dimensions: LabelDimensions
): Promise<string> => {
  // In a real implementation, this would call the Labelary API
  // For this demo, we'll create a mock URL that would show what the preview looks like
  
  // Encode the ZPL code for URL usage
  const encodedZpl = encodeURIComponent(zplCode);
  
  // Normally, we would make a real API call:
  /*
  const response = await axios.post(
    `http://api.labelary.com/v1/printers/8dpmm/labels/${dimensions.width}x${dimensions.height}/0/`,
    zplCode,
    {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/png',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  // Convert the response to a base64 image URL
  const base64 = Buffer.from(response.data).toString('base64');
  return `data:image/png;base64,${base64}`;
  */
  
  // For the demo, create a mock URL using Labelary's GET endpoint
  return `https://api.labelary.com/v1/printers/8dpmm/labels/${dimensions.width}x${dimensions.height}/0/${encodedZpl}`;
};