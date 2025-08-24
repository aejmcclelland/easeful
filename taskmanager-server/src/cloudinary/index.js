const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'TaskManager',
		formats: ['jpeg', 'jpg', 'pdf', 'png'],
		// Generate a custom filename
		filename: (req, file, cb) => {
			const id = req.params.id || 'new';
			const uniqueFilename = `photo_${id}_${Date.now()}${path.extname(
				file.originalname
			)}`;
			cb(undefined, uniqueFilename);
		},
	},
});

module.exports = {
	cloudinary,
	storage,
};
