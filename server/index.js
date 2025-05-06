import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Handle multipart form data for label generation
app.post('/api/generate-label', upload.fields([
  { name: 'barcodeImage', maxCount: 1 },
  { name: 'certificationsImage', maxCount: 1 },
  { name: 'warningsImage', maxCount: 1 }
]), (req, res) => {
  try {
    // Get form data
    const { modelName, serialNumber, cartonSize, labelType } = req.body;
    
    // Get file paths
    const files = req.files;
    const barcodeImagePath = files?.barcodeImage?.[0]?.path;
    const certificationsImagePath = files?.certificationsImage?.[0]?.path;
    const warningsImagePath = files?.warningsImage?.[0]?.path;
    
    // Generate mock ZPL code (in a real app, this would actually generate real ZPL)
    const zplCode = generateMockZpl(
      modelName,
      serialNumber,
      cartonSize,
      labelType,
      barcodeImagePath,
      certificationsImagePath,
      warningsImagePath
    );
    
    // Return the generated ZPL code
    res.json({ success: true, zplCode });
  } catch (error) {
    console.error('Error generating label:', error);
    res.status(500).json({ success: false, error: 'Failed to generate label' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});