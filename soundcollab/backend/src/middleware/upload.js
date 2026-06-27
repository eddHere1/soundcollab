const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const audioDir = path.join(uploadDir, 'audio');
const imageDir = path.join(uploadDir, 'images');
const attachmentDir = path.join(uploadDir, 'attachments');

[uploadDir, audioDir, imageDir, attachmentDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'audio') cb(null, audioDir);
    else if (file.fieldname === 'profileImage' || file.fieldname === 'bannerImage' || file.fieldname === 'coverImage') cb(null, imageDir);
    else if (file.fieldname === 'attachment') cb(null, attachmentDir);
    else cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    return cb(new Error('Only audio files are allowed'));
  }
  if (file.fieldname === 'profileImage' || file.fieldname === 'bannerImage' || file.fieldname === 'coverImage') {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;
