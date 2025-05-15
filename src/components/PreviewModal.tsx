import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { base64ToZpl,base64ToZplAndSave } from '../services/globalFunctions'; // Assuming this is where your base64ToZpl function is
import { imagePathToZpl } from '../services/imageToZplService'

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  sideImageUrl : string | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, imageUrl, sideImageUrl }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'zpl'>('preview'); // To toggle between preview and ZPL code
  const [zplCode, setZplCode] = useState<string | null>(null);
  const [zplCodeSide, setZplCodeSide] = useState<string | null>(null);


  useEffect(() => {
    // Convert base64 image to ZPL code when imageUrl changes
    if (imageUrl) {
      const fetchZplCode = async () => {
        try {
          const generateImage = await base64ToZplAndSave(imageUrl,"front")

          const generateImageSide = await base64ToZplAndSave(sideImageUrl || "","side")

          const code = await imagePathToZpl(generateImage)
          const code_side = await imagePathToZpl(generateImageSide)

          setZplCode(code);
          setZplCodeSide(code_side)
        } catch (error) {
          console.error('Error converting image to ZPL:', error);
          setZplCode('Error generating ZPL code');
        }
      };
      fetchZplCode();
    }
  }, [imageUrl,sideImageUrl]);

  if (!isOpen || !imageUrl || !sideImageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-lg max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">Label Preview</h2>

        <div className="mb-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Image Preview
            </button>
            <button
              onClick={() => setActiveTab('zpl')}
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'zpl' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              ZPL Code
            </button>
          </div>

          {/* Image Preview Tab */}
          {activeTab === 'preview' && (
            <>            
              <div className="flex flex-wrap justify-center gap-8">
                {/* Front View */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2">Front Label</h2>
                  <img src={imageUrl} alt="Front Label Preview" className="max-w-xs border" />
                </div>

                {/* Side View */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2">Side Label</h2>
                  <img src={sideImageUrl} alt="Side Label Preview" className="max-w-xs border" />
                </div>
              </div>
            </>
          )}

          {/* ZPL Code Tab */}
          {activeTab === 'zpl' && (
            <>
              Front Label            
              <div className="p-4 bg-gray-100 rounded-md overflow-auto">
                {zplCode ? (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{zplCode}</pre>
                ) : (
                  <p>Loading ZPL code...</p>
                )}
              </div>
              <br>
              </br>
              Side Label            
              <div className="p-4 bg-gray-100 rounded-md overflow-auto">
                {zplCodeSide ? (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{zplCodeSide}</pre>
                ) : (
                  <p>Loading ZPL code...</p>
                )}
              </div>


            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
