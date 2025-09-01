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
		allowed_formats: ['jpeg', 'jpg', 'png', 'pdf'],
		// Generate a custom public_id instead of filename
		public_id: (req, file) => {
			const id = req.params.id || req.user?.id || 'new';
			const timestamp = Date.now();
			const name = file.originalname.split('.')[0]; // Remove extension
			return `${file.fieldname}_${id}_${timestamp}_${name}`;
		},
	},
});

module.exports = {
	cloudinary,
	storage,
};
