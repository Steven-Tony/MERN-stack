import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
const router = express.Router();

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/books/') // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép file ảnh!'), false);
    }
  }
});

// API upload ảnh
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    res.json({
      filename: req.file.filename,
      path: `/images/books/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload thất bại', error: error.message });
  }
});

// API check file đã tồn tại
router.post('/check', async (req, res) => {
  try {
    const { filename } = req.body; // Lấy tên file từ form
    
    // Kiểm tra file có tồn tại trong thư mục không
    const filePath = path.join('public/images/books', filename);
    const fileExists = await fs.access(filePath)
      .then(() => true)
      .catch(() => false);
    
    return res.json({
      exists: fileExists,
      filename: fileExists ? filename : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;