// Optional Cloudinary configuration
// If CLOUDINARY_CLOUD_NAME is set, uploads go to Cloudinary
// Otherwise, files are stored locally in /uploads

let cloudinary = null;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary configured');
  } catch (err) {
    console.log('Cloudinary package not installed, using local uploads');
  }
}

module.exports = cloudinary;
