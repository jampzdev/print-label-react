import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { LabelData, LabelFormProps } from '../types';
import { supabase } from '../supabaseClient';

const LabelForm: React.FC<LabelFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LabelData>({
    modelName: '',
    brandName: '',
    categoryName : '',
    serialNumber: '',
    cartonHeight: 0,
    cartonWidth: 0,
    cartonDepth: 0,
    userManualQr : '',
    labelType: {
      id: 0,
      type_name: '',
      zpl_format: ''
    },
    labelTypeId: undefined,
    labelSize: {
      id: 0,
      size_name: '',
      label_type_id: 0,
      width: 0,
      height: 0,
    },
    barcodeImage: null,
    certificationsImage: null,
    warningsImage: null,
    userManual: null,
  });

  const [labelTypes, setLabelTypes] = useState<{ type_name: string; id: number, zpl_format: string }[]>([]);
  const [labelSizes, setLabelSizes] = useState<LabelData['labelSize'][]>([]);

  const [modelSearchInput, setModelSearchInput] = useState('');

  useEffect(() => {
    const fetchLabelTypes = async () => {
      const { data, error } = await supabase
        .from('label_type')
        .select('*')
        .order('type_name', { ascending: true });

      if (error) {
        console.error('Error fetching label types:', error);
      } else if (data && data.length) {
        setLabelTypes(data);
        setFormData((prev) => ({
          ...prev,
          labelType: data[0],
          labelTypeId: data[0].id,
        }));
      }
    };

    fetchLabelTypes();
  }, []);

  useEffect(() => {
    const fetchLabelSizes = async () => {
      if (!formData.labelTypeId) return;

      const { data, error } = await supabase
        .from('label_sizes')
        .select('*')
        .eq('label_type_id', formData.labelTypeId);

      if (error) {
        console.error('Error fetching label sizes:', error);
      } else {
        setLabelSizes(data || []);
        if (data && data.length) {
          setFormData((prev) => ({
            ...prev,
            labelSize: data[0],
          }));
        }
      }
    };

    fetchLabelSizes();
  }, [formData.labelTypeId]);

  const handleModelSearch = async () => {
    if (!modelSearchInput.trim()) return;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (
          brand_name
        ),
        product_category (
          category_name
        )
      `)
      .ilike('product_name', `%${modelSearchInput}%`)
      .limit(5);

    if (error) {
      console.error('Error fetching models:', error);
    } else {
      if (data && data.length) {
        const selected = data[0];
        setFormData((prev) => ({
          ...prev,
          modelName: selected.product_name,
          serialNumber: selected.serial_number,
          brandName: selected.brands?.brand_name || '',
          categoryName: selected.product_category?.category_name || '',
          userManualQr : selected.user_manual_qr_path
        }));
      }
      else{
        setFormData((prev) => ({
          ...prev,
          modelName: '',
          serialNumber: '',
          brandName: '',
          categoryName: '',
          userManualQr : ''
        }));
      }
    }
  };

  const handleModelSelect = (selected: { value: string } | null) => {
    setFormData((prev) => ({
      ...prev,
      modelName: selected?.value || '',
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'labelType') {
      const selected = labelTypes.find((type) => type.type_name === value);
      setFormData((prev) => ({
        ...prev,
        labelType: selected || { id: 0, type_name: '',zpl_format : '' },
        labelTypeId: selected?.id,
        labelSize: {
          id: 0,
          size_name: '',
          label_type_id: 0,
          width: 0,
          height: 0,
        },
      }));
    } else if (name === 'labelSize') {
      const selectedSize = labelSizes.find((s) => s.size_name === value);
      if (selectedSize) {
        setFormData((prev) => ({
          ...prev,
          labelSize: selectedSize,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (field: keyof LabelData) => (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
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
          {/* Label Type */}
          <div>
            <label htmlFor="labelType" className="block text-sm font-medium text-gray-700 mb-1">
              Label Type
            </label>
            <select
              id="labelType"
              name="labelType"
              value={formData.labelType.type_name}
              onChange={handleTextChange}
              className="block w-full p-2 border rounded"
              required
            >
              {labelTypes.map((type) => (
                <option key={type.id} value={type.type_name}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Show model, serial, and brand only if Label Type is "Model Name" */}
          {formData.labelType.type_name === 'Model Name' && (
            <>
              {/* Model Name */}
              <div>
                <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
                  Model Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="modelName"
                    name="modelName"
                    value={modelSearchInput}
                    onChange={(e) => setModelSearchInput(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Enter model name"
                    onKeyUp={(e) => e.key === 'Enter' && handleModelSearch()}
                  />
                  <button
                    type="button"
                    onClick={handleModelSearch}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Serial Number */}
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
                  className="block w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Brand Name */}
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
                  className="block w-full p-2 border rounded"
                  required
                />
              </div>
            </>
          )}

          {/* Label Size */}
          {formData.labelType.type_name !== 'Model Name' && (
            <div>
              <label htmlFor="labelSize" className="block text-sm font-medium text-gray-700 mb-1">
                Label Size
              </label>
              <select
                id="labelSize"
                name="labelSize"
                value={formData.labelSize.size_name || ''}
                onChange={handleTextChange}
                className="block w-full p-2 border rounded"
                required
              >
                {labelSizes.map((size) => (
                  <option key={size.id} value={size.size_name}>
                    {size.size_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Carton Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carton Size (in)</label>
            <div className="flex gap-4">
              <div className="w-1/3">
                <label htmlFor="cartonHeight" className="block text-sm text-gray-600">
                  Height
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cartonHeight"
                  name="cartonHeight"
                  value={formData.cartonHeight}
                  onChange={handleTextChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="w-1/3">
                <label htmlFor="cartonWidth" className="block text-sm text-gray-600">
                  Width
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cartonWidth"
                  name="cartonWidth"
                  value={formData.cartonWidth}
                  onChange={handleTextChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="w-1/3">
                <label htmlFor="cartonDepth" className="block text-sm text-gray-600">
                  Depth
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cartonDepth"
                  name="cartonDepth"
                  value={formData.cartonDepth}
                  onChange={handleTextChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <ImageUploader id="barcodeImage" label="Barcode Image" onChange={handleImageChange('barcodeImage')} />
          <ImageUploader id="certificationsImage" label="Certifications Image" onChange={handleImageChange('certificationsImage')} />
          <ImageUploader id="warningsImage" label="Warnings Image" onChange={handleImageChange('warningsImage')} />
          <ImageUploader id="userManual" label="User Manual (PDF)" onChange={handleImageChange('userManual')} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
        >
          <Printer size={18} className="mr-2" />
          Generate Preview
        </button>
      </div>
    </form>
  );
};

export default LabelForm;
