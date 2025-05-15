import React, { useState, useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import ImageUploader from './ImageUploader';
import LabelModelTemplateFront from '../templates/LabelModelTemplateFront';
import LabelModelTemplateSide from '../templates/LabelModelTemplateSide';
import PreviewModal from './PreviewModal'; // Import the modal here
import { LabelData, LabelFormProps, LabelSizeQueryResult } from '../types';
import { supabase } from '../supabaseClient';
import { toBmp } from '../services/globalFunctions'

import { inchesToMillimeters,millimeterToPixels } from '../services/globalFunctions';
import { toPng } from 'html-to-image';


const LabelForm: React.FC<LabelFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LabelData>({
    modelName: '',
    productName :'',
    brandName: '',
    categoryName: '',
    serialNumber: '',
    cartonHeight: 0,
    cartonWidth: 0,
    cartonDepth: 0,
    userManualQr: '',
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageSide, setPreviewImageSide] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewRefSide = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchLabelTypes = async () => {
      const { data, error } = await supabase
        .from('label_type')
        .select('*')
        .order('type_name', { ascending: true });

      if (!error && data?.length) {
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

      if (!error) {
        setLabelSizes(data || []);
        if (data?.length) {
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
      .ilike('model_name', `%${modelSearchInput}%`)
      .limit(5);

    if (data?.length) {
      const selected = data[0];
      setFormData((prev) => ({
        ...prev,
        modelName: selected.model_name,
        serialNumber: selected.serial_number,
        brandName: selected.brands?.brand_name || '',
        categoryName: selected.product_category?.category_name || '',
        userManualQr: selected.user_manual_qr_path,
        productName : selected.product_name
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        modelName: '',
        serialNumber: '',
        brandName: '',
        categoryName: '',
        userManualQr: '',
        productName : ''
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'labelType') {
      const selected = labelTypes.find((type) => type.type_name === value);
      if (selected && selected.id !== formData.labelTypeId) {
        setFormData((prev) => ({
          ...prev,
          labelType: selected,
          labelTypeId: selected.id,
          labelSize: {
            id: 0,
            size_name: '',
            label_type_id: 0,
            width: 0,
            height: 0,
          },
        }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewRef.current) {
      try {
        console.log("previewRef.current",previewRef.current)
        console.log("previewSide.current",previewRefSide.current)

        console.log(formData)

        let convertedWidth = inchesToMillimeters(formData.cartonWidth)
        let convertedHeight = inchesToMillimeters(formData.cartonHeight)

        console.log("convertedWidth",convertedWidth)
        console.log("convertedHeight",convertedHeight)

        const { data, error } = await supabase
        .from('label_sizes')
        .select(`
          *,
          label_side_sizes (
          id,
          side_size_name,
          max_width,
          max_height,
          min_width,
          min_height
          )
          `)
        
        .eq('label_type_id', formData.labelType.id)

        if (error) {
          console.error(error);
        } else {

          console.log("tangina data",data)
          
          const filtered = data?.filter(row => 
            // Check if the width is between min_width and max_width
            convertedWidth >= row.min_width &&
            convertedWidth <= row.max_width &&
            
            // Check if the height is between min_height and max_height
            convertedHeight >= row.min_height &&
            convertedHeight <= row.max_height
          );

          if (filtered && filtered.length > 0) {
            const side = filtered[0].label_side_sizes[0]
            console.log("side",side)
            const labelSizeMatch: LabelSizeQueryResult = {
              min_width: filtered[0].min_width,
              max_width: filtered[0].max_width,
              min_height: filtered[0].min_height,
              max_height: filtered[0].max_height,
              size_name : filtered[0].size_name,
              side_details : {
                id: side.id,
                size_name: side.side_size_name,
                width: side.min_width,
                height: side.min_height
              },
            };
            
          
            let widthPx = millimeterToPixels(labelSizeMatch.min_width)
            let heightPx = millimeterToPixels(labelSizeMatch.min_height)

            
            console.log("widthPx",widthPx)
            console.log("heightPx",heightPx)

            const dataUrl = await toPng(previewRef.current,{
              cacheBust: true,
              width: widthPx, // Set a reasonable width to ensure image generation
              height: heightPx, // Set a fixed height for the preview image
            });

            if(previewRefSide.current){
              console.log(labelSizeMatch)


              let sideWidthPx = millimeterToPixels(labelSizeMatch.side_details?.width || 0)
              let sideHeightPx = millimeterToPixels(labelSizeMatch.side_details?.height || 0)

              console.log("sideWidthPx",sideWidthPx)
              console.log("sideHeightPx",sideHeightPx)

              const dataUrlSide = await toPng(previewRefSide.current,{
                cacheBust: true,
                width: sideWidthPx, // Set a reasonable width to ensure image generation
                height: sideHeightPx, // Set a fixed height for the preview image
              });

              console.log("pukingina",dataUrlSide)
              setPreviewImageSide(dataUrlSide); // Set the preview image in the state
            }

            setPreviewImage(dataUrl); // Set the preview image in the state

            setIsModalOpen(true); // Open the modal to show the preview
          }
        }
      } catch (error) {
        console.error('Failed to generate preview image:', error);
      }
    }
  };
  

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Printer className="mr-2 text-blue-600" size={28} />
          Zebra Label Generator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="space-y-4">
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

            {formData.labelType.type_name === 'Model Name' && (
              <>
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

                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleTextChange}
                      className="flex-1 p-2 border rounded"
                      placeholder="Enter product name"
                    />
                  </div>
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
                    className="block w-full p-2 border rounded"
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
                    className="block w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleTextChange}
                    className="block w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label Size</label>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label htmlFor="cartonWidth" className="block text-sm text-gray-600">Width (in)</label>
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
                    <div className="w-1/2">
                      <label htmlFor="cartonHeight" className="block text-sm text-gray-600">Height (in)</label>
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
                  </div>
                </div>

              </>
            )}

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
              >
                {labelSizes.map((size) => (
                  <option key={size.id} value={size.size_name}>
                    {size.size_name}
                  </option>
                ))}
              </select>
            </div>
          )}


          </div>

          {/* <div className="space-y-4">
            <ImageUploader  id="barcodeImage" label="Barcode Image" onChange={handleImageChange('barcodeImage')} />
            <ImageUploader  id="certImage" label="Certifications Image" onChange={handleImageChange('certificationsImage')} />
            <ImageUploader  id="warningImage" label="Warnings Image" onChange={handleImageChange('warningsImage')} />
            <ImageUploader  id="userManualImage" label="User Manual QR" onChange={handleImageChange('userManual')} />
          </div> */}
        </div>

        <div className="mt-6 text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Preview
          </button>
        </div>
      </form>

      {/* Hidden render target for html-to-image */}
      <div className="hidden">
        <div ref={previewRef}>
          <LabelModelTemplateFront data={formData} />
        </div>
      </div>

      {/* Hidden render target for html-to-image */}
      <div className="hidden">
        <div ref={previewRefSide}>
          <LabelModelTemplateSide data={formData} />
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={previewImage}
        sideImageUrl= {previewImageSide}
      />
    </>
  );
};

export default LabelForm;
