import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Save images in ../uploads/images/generated_images/
const generatedImagesDir = path.resolve(__dirname, '../uploads/images/generated_images');

// Ensure target directory exists
fs.mkdirSync(generatedImagesDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, generatedImagesDir);
  },
  filename: function (req, file, cb) {
    const nickname = req.body.nickname || 'image';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${nickname}_${timestamp}${ext}`);
  }
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'))); // Serve uploads

// Save image endpoint
app.post('/api/save-image', upload.single('image'), (req, res) => {
  try {
    const file = req.file;
    const nickname = req.body.nickname;

    if (!file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // File is saved in ../uploads/images/generated_images
    const fileName = path.basename(file.path);
    const relativePath = `/uploads/images/generated_images/${fileName}`; // Public URL path

    console.log(`Image saved: ${relativePath}`);
    res.status(200).json({ filePath: relativePath });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ message: 'Error saving the image', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
