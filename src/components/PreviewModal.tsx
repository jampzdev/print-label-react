import React, { useState, useEffect } from 'react';
import { X, Move } from 'lucide-react';
import Draggable from 'react-draggable';
import { PreviewModalProps, LabelElement } from '../types';
import { generateZplPreviewUrl } from '../services/labelaryService';
import { generateZplFromElements } from '../services/zplGenerator';

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, labelData, zplCode, onZplUpdate, elementData }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'zpl'>('preview');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<LabelElement[]>([]);

  useEffect(() => {
    console.log("labyuu",elementData)
    if (labelData) {
      // Initialize draggable elements
      const initializedElements = elementData.map((element: LabelElement) => ({
        id: element.id,
        type: element.type,
        content: element.content,
        position: { x: element.position.x, y: element.position.y },
        size: { width: element.size.width, height: element.size.height }
      }));

      setElements(initializedElements)
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
    
    const dimensions = labelData.labelType === 'front' 
      ? { width: 5.80, height: 4.58 } 
      : { width: 3.48, height: 6.03 };
    
    // Generate new ZPL code based on element positions
    const newZplCode = generateZplFromElements(elements, dimensions, labelData);
    onZplUpdate(newZplCode);
    
    try {
      const url = await generateZplPreviewUrl(newZplCode, dimensions);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate label preview');
    } finally {
      setLoading(false);
    }
  };

  // const handleDrag = (id: string, e: any, data: { x: number; y: number }) => {
  //   setElements(elements.map(el => 
  //     el.id === id ? { ...el, position: { x: data.x, y: data.y } } : el
  //   ));
  // };

  const handleChange = (id: string, field: string, newValue: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          if (field === 'content') {
            return { ...el, content: newValue };
          } else if (field === 'x' || field === 'y') {
            // Update the x or y position
            return {
              ...el,
              position: {
                ...el.position,
                [field]: parseInt(newValue, 10) || 0, // Ensure it's a number (default to 0 if invalid)
              },
            };
          } else if (field === 'size') {
            // Update the font size
            return {
              ...el,
              size: {
                ...el.size,
                height: parseInt(newValue, 10) || 0,
                width: parseInt(newValue, 10) || 0,
                
                // Ensure it's a number (default to 0 if invalid)
              },
            };
          }
        }
        return el; // return the element unchanged if it doesn't match the id
      })
    );
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Label Preview</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
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
                    Label size: {labelData?.labelType === 'front' ? '5.80 x 4.58 in' : '3.48 x 6.03 in'}
                  </p>
                  <div className="relative border border-gray-300">
                    <img 
                      src={previewUrl} 
                      alt="Label Preview" 
                      className="max-w-full max-h-[60vh]"
                    />
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className="mb-2 p-2 bg-blue-100 bg-opacity-50 rounded flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-blue-600 w-24">{element.id}</label>
                        <input
                          type="text"
                          value={element.content}
                          onChange={(e) => handleChange(element.id, 'content', e.target.value)}
                          className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none"
                        />
                      </div>

                      {/* Grouping X, Y Position in a single row */}
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-blue-600 w-24">X position</label>
                          <input
                            type="number"
                            value={element.position.x}
                            onChange={(e) => handleChange(element.id, 'x', e.target.value)}
                            className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-blue-600 w-24">Y position</label>
                          <input
                            type="number"
                            value={element.position.y}
                            onChange={(e) => handleChange(element.id, 'y', e.target.value)}
                            className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* New row for size */}
                      <div className="flex items-center gap-2 mt-2">
                        <label className="text-sm text-blue-600 w-24">Size</label>
                        <input
                          type="number"
                          value={element.size.width} // Assuming size has width and height
                          onChange={(e) => handleChange(element.id, 'size', e.target.value)}
                          className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  </div>
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