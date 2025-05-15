export interface LabelData {
  modelName: string;
  brandName : string;
  categoryName : string;
  serialNumber: string;
  cartonHeight: number;
  cartonWidth: number;
  cartonDepth: number;
  userManualQr : string;
  productName?: string;
  labelType: {
    id : number,
    type_name : string,
    zpl_format : string,
  };
  labelTypeId?:number;
  labelSize : {
    id: number,
    size_name : string,
    label_type_id : number,
    width : number,
    height : number
  };
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

export interface LabelSizeQueryResult {
  min_width: number;
  max_width: number;
  min_height: number;
  max_height: number;
  size_name : string;
  side_details? : {
    id: number,
    size_name : string,
    width : number,
    height : number
  };
}

