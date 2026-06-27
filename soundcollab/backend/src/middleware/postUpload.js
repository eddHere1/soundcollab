const upload = require('./upload');

/** Accept audio + optional cover art without multer "unexpected field" errors */
function postUpload(req, res, next) {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    const files = req.files || [];
    req.audioFile = files.find((f) => f.fieldname === 'audio') || null;
    req.coverFile = files.find((f) => f.fieldname === 'coverImage' || f.fieldname === 'cover') || null;
    next();
  });
}

/** Profile / banner images */
function profileUpload(req, res, next) {
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    next();
  });
}

module.exports = { postUpload, profileUpload };
