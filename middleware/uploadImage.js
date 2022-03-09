const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: "ruslansobol",
  api_key: "264313891475253",
  api_secret: "aaEi4ULiDWfwWGlRMG3RWQQb-4w",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DEV'
  },
});

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//      cb(null, 'uploads');
//   },
//   filename: function (req, file, cb) {
//     datetime = Date.now();
//     req.filename = Date.now() + '-' + file.originalname;

//      cb(null, req.filename);
//   }
// });
var upload = multer({ storage: storage });

const uploadImage = {
  multerMiddleware: upload.single("image")
};

module.exports = uploadImage;
