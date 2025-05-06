import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PreviewModalProps, LabelElement } from '../types';
import { generateZplPreviewUrl } from '../services/labelaryService';
import { generateZplFromElements } from '../services/zplGenerator';

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  labelData,
  zplCode,
  onZplUpdate,
  elementData,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'zpl'>('preview');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sidePreviewUrl, setSidePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<LabelElement[]>([]);

  useEffect(() => {
    if (labelData) {
      const initializedElements = elementData.map((element: LabelElement) => ({
        ...element,
        position: { ...element.position },
        size: { ...element.size },
      }));
      setElements(initializedElements);
    }
  }, [labelData]);

  useEffect(() => {
    if (isOpen && activeTab === 'preview') {
      updatePreview();
    }
  }, [isOpen, activeTab, elements]);

  const updatePreview = async () => {
    if (!labelData) return;
    setLoading(true);
    setError(null);

    const dimensions = {
      width: labelData.cartonWidth || 100,
      height: labelData.cartonHeight || 100,
    };

    const side_dimensions = {
      width: 3.48,
      height: 6.03,
    };

    try {
      const newZplCode = generateZplFromElements(elements, dimensions, labelData,'front');
      onZplUpdate(newZplCode);

      const url = await generateZplPreviewUrl(newZplCode, dimensions);
      setPreviewUrl(url);

      // If label type is "Model Name", generate a second (side) preview
      if (labelData.labelType?.type_name === 'Model Name') {
        const sideElements = [...elements]; // You can customize this for different layouts
        const sideZpl = generateZplFromElements(sideElements, side_dimensions, labelData,'side');
        const sideUrl = await generateZplPreviewUrl(sideZpl, side_dimensions);
        setSidePreviewUrl(sideUrl);
      } else {
        setSidePreviewUrl(null);
      }
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate label preview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isModelLabel = labelData?.labelType?.type_name === 'Model Name';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Label Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex space-x-2 px-4 pt-4">
          <button
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'zpl'
                ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('zpl')}
          >
            ZPL Code
          </button>
        </div>

        <div className="flex-1 p-4 border border-gray-200 rounded-b-lg rounded-tr-lg m-4 mt-0 overflow-auto">
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center justify-center h-full relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Generating preview...</p>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-4">
                  <p>{error}</p>
                  <button
                    onClick={() => setActiveTab('zpl')}
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    View ZPL code instead
                  </button>
                </div>
              ) : previewUrl ? (
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-sm text-gray-500">
                    Label size: {labelData?.labelSize.width} mm x {labelData?.labelSize.height} mm
                  </p>
                  {isModelLabel ? (
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-center mb-1 text-gray-600">Front Label</p>
                        <img
                          src={previewUrl}
                          alt="Front Label Preview"
                          className="max-w-[250px] border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-center mb-1 text-gray-600">Side Label</p>
                        <img
                          src={sidePreviewUrl || previewUrl}
                          alt="Side Label Preview"
                          className="max-w-[250px] border border-gray-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Label Preview"
                      className="max-w-full max-h-[60vh] border border-gray-300"
                    />
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No preview available</p>
              )}
            </div>
          )}

          {activeTab === 'zpl' && (
            <div className="h-full">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm h-full whitespace-pre-wrap">
                {zplCode || 'No ZPL code generated'}
              </pre>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
