import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { ImageUploaderProps } from '../types';

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onChange, id }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
      onChange(file);
    } else {
      setPreview(null);
      setFileName('');
      onChange(null);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div 
          className="flex-1 border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            id={id}
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="max-h-24 mx-auto rounded" />
              <div className="mt-2 text-sm text-center text-gray-500 truncate max-w-full">
                {fileName}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-blue-500">
              <Upload size={24} />
              <span className="mt-2 text-sm text-gray-500">Click to upload</span>
            </div>
          )}
        </div>
        
        {preview && (
          <button 
            type="button" 
            onClick={handleClear}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;