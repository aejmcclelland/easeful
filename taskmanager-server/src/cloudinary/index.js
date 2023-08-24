const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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
			const uniqueFilename = `photo_${req.params.id}${path.extname(
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
