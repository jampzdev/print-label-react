import React, { useState } from 'react';
import LabelForm from './components/LabelForm';
import PreviewModal from './components/PreviewModal';
import { LabelData } from './types';
import { LabelElement } from './types';
import { generateZplCode } from './services/zplGenerator';
import { FileText, Printer } from 'lucide-react';

function App() {
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zplCode, setZplCode] = useState<string>('');
  const [elementData, setElementData] = useState<LabelElement[] | null>(null);

  const handleSubmit = (data: LabelData) => {
    setLabelData(data);
    
    // Generate initial ZPL code
    const generatedZpl = generateZplCode(data);
    console.log("wwwwwwwwwwwwwwew",generatedZpl)
    setZplCode(generatedZpl.zpl);

    setElementData(generatedZpl.elements)
    
    // Open the preview modal
    setIsModalOpen(true);
  };

  const handleZplUpdate = (newZpl: string) => {
    setZplCode(newZpl);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Printer className="mr-3 text-blue-600" size={32} />
            ZPL Label Generator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate and preview Zebra Programming Language (ZPL) labels for printing. Input your data, 
            select label type, and preview before printing.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-10">
          <div className="flex items-center mb-6">
            <FileText className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Enter Label Information</h2>
          </div>
          
          <LabelForm onSubmit={handleSubmit} />
        </div>
        
        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          labelData={labelData}
          zplCode={zplCode}
          onZplUpdate={handleZplUpdate}
          elementData={elementData}
        />
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 ZPL Label Generator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;