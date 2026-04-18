import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Setup Local Storage using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // You must create a folder named public/uploads!
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// POST ROUTE: /api/upload
router.post('/', upload.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Build the public URL to return to the frontend
  // Example result: http://localhost:8000/uploads/attachment-123.png
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  res.status(200).json({ 
    message: "File uploaded successfully", 
    url: fileUrl,
    type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
  });
});

export default router;
