import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { LabelData, LabelFormProps } from '../types';

const LabelForm: React.FC<LabelFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LabelData>({
    modelName: '',
    brandName : '',
    serialNumber: '',
    cartonHeight: '',
    cartonWidth: '',
    cartonDepth: '',
    labelType: 'front',
    barcodeImage: null,
    certificationsImage: null,
    warningsImage: null,
    userManual: null
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (field: 'barcodeImage' | 'certificationsImage' | 'warningsImage' | 'userManual') => (file: File | null) => {
    setFormData({
      ...formData,
      [field]: file
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Printer className="mr-2 text-blue-600" size={28} />
        Zebra Label Generator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="labelType" className="block text-sm font-medium text-gray-700 mb-1">
              Label Type
            </label>
            <select
              id="labelType"
              name="labelType"
              value={formData.labelType}
              onChange={handleTextChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            >
              <option value="front">Front Label (5.80 × 4.58 in)</option>
              <option value="side">Side Label (3.48 × 6.03 in)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              id="modelName"
              name="modelName"
              value={formData.modelName}
              onChange={handleTextChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleTextChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>
          
          <div>
            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleTextChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cartonHeight" className="block text-sm font-medium text-gray-700 mb-1">
                Height (in)
              </label>
              <input
                type="number"
                step="0.01"
                id="cartonHeight"
                name="cartonHeight"
                value={formData.cartonHeight}
                onChange={handleTextChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="cartonWidth" className="block text-sm font-medium text-gray-700 mb-1">
                Width (in)
              </label>
              <input
                type="number"
                step="0.01"
                id="cartonWidth"
                name="cartonWidth"
                value={formData.cartonWidth}
                onChange={handleTextChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="cartonDepth" className="block text-sm font-medium text-gray-700 mb-1">
                Depth (in)
              </label>
              <input
                type="number"
                step="0.01"
                id="cartonDepth"
                name="cartonDepth"
                value={formData.cartonDepth}
                onChange={handleTextChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <ImageUploader
            id="barcodeImage"
            label="Barcode Image"
            onChange={handleImageChange('barcodeImage')}
          />
          
          <ImageUploader
            id="certificationsImage"
            label="Certifications Image"
            onChange={handleImageChange('certificationsImage')}
          />
          
          <ImageUploader
            id="warningsImage"
            label="Warnings Image"
            onChange={handleImageChange('warningsImage')}
          />

          <ImageUploader
            id="userManual"
            label="User Manual (PDF)"
            onChange={handleImageChange('userManual')}
          />
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
        >
          <Printer size={18} className="mr-2" />
          Generate Preview
        </button>
      </div>
    </form>
  );
};

export default LabelForm;