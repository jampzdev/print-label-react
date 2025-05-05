export interface LabelData {
  modelName: string;
  brandName : string;
  serialNumber: string;
  cartonHeight: string;
  cartonWidth: string;
  cartonDepth: string;
  labelType: 'front' | 'side';
  barcodeImage: File | null;
  certificationsImage: File | null;
  warningsImage: File | null;
  userManual: File | null;
}

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelData: LabelData | null;
  zplCode: string;
  onZplUpdate: (newZpl: string) => void;
  elementData : any
}

export interface TabProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

export interface LabelFormProps {
  onSubmit: (data: LabelData) => void;
}

export interface ImageUploaderProps {
  label: string;
  onChange: (file: File | null) => void;
  id: string;
}

export interface LabelDimensions {
  width: number;
  height: number;
}

export interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'image';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}