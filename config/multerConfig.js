const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// diskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/pics');
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12,(err,bytes)=>{
        fileName = bytes.toString('hex') + path.extname(file.originalname);
        cb(null, fileName);
      })
    }
  })
  
  const upload = multer({ storage: storage });

  module.exports = upload;
  