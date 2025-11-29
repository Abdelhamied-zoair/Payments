import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure uploads directory exists
function ensureUploadsDir() {
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  }
  return dir;
}

// Validate file type
function isValidMimeType(mimeType) {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename
    .replace(/[^\w\d.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[_.]/, '') // Remove leading dots/underscores
    .trim()
    .toLowerCase();
}

// Upload invoice file as base64
router.post('/invoice', authRequired, async (req, res, next) => {
  try {
    const { data, name } = req.body || {};
    
    // Validate input
    if (!data) {
      return res.status(400).json({ error: 'البيانات مطلوبة' });
    }

    const m = String(data);
    const match = m.match(/^data:(.+?);base64,(.+)$/);
    
    if (!match) {
      return res.status(400).json({ error: 'رابط البيانات غير صالح' });
    }

    const mime = match[1];
    const b64 = match[2];
    
    // Validate MIME type
    if (!isValidMimeType(mime)) {
      return res.status(400).json({ 
        error: 'نوع الملف غير مدعوم',
        allowedTypes: ALLOWED_MIME_TYPES
      });
    }

    // Decode and validate file size
    const buf = Buffer.from(b64, 'base64');
    
    if (buf.length > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `حجم الملف يتجاوز الحد المسموح به (${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت)`
      });
    }

    // Generate safe filename
    const ext = mime.split('/')[1] || 'bin';
    const timestamp = Date.now();
    const originalName = name ? path.basename(name) : `ملف_${timestamp}`;
    const safeName = `${timestamp}_${sanitizeFilename(originalName)}.${ext}`;
    
    // Ensure upload directory exists
    const dir = ensureUploadsDir();
    const filePath = path.join(dir, safeName);
    
    // Write file
    await fs.promises.writeFile(filePath, buf);
    
    // Set proper permissions (read/write for owner, read for others)
    await fs.promises.chmod(filePath, 0o644);
    
    const url = `/files/${safeName}`;
    
    return res.status(201).json({ 
      success: true,
      filename: safeName,
      originalName: name || '',
      url,
      mime,
      size: buf.length,
      uploadedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('فشل رفع الملف:', error);
    
    // Handle specific errors
    if (error.code === 'ENOENT') {
      return res.status(500).json({ error: 'تعذر إنشاء مجلد التحميل' });
    }
    
    if (error.code === 'EACCES') {
      return res.status(500).json({ error: 'لا توجد صلاحيات كافية لحفظ الملف' });
    }
    
    if (error.code === 'ENOSPC') {
      return res.status(500).json({ error: 'مساحة التخزين غير كافية' });
    }
    
    // If response already sent, pass to next error handler
    if (res.headersSent) {
      next(error);
    } else {
      return res.status(500).json({ 
        error: 'حدث خطأ أثناء رفع الملف',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// File download endpoint
router.get('/download/:filename', authRequired, (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!filename) {
      return res.status(400).json({ error: 'اسم الملف مطلوب' });
    }
    
    // Prevent directory traversal
    const safeFilename = path.basename(filename);
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, safeFilename);
    
    // Additional security: ensure file is within uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'مسار الملف غير صالح' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file with error handling
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('فشل قراءة الملف:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'حدث خطأ أثناء تحميل الملف' });
      }
    });
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('فشل تحميل الملف:', error);
    if (!res.headersSent) {
      next(error);
    }
  }
});

export default router;
