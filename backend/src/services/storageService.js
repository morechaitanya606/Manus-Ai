const fs = require('fs/promises');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

if (process.env.STORAGE_PROVIDER === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const toPublicUrl = (filePath) => {
  const normalized = filePath.split(path.sep).join('/');
  return `/${normalized.substring(normalized.indexOf('uploads/'))}`;
};

const uploadSingleImage = async (file) => {
  if (!file) return null;

  if (process.env.STORAGE_PROVIDER === 'cloudinary') {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'fashion-ecommerce/products'
    });
    await fs.unlink(file.path);
    return { url: result.secure_url, publicId: result.public_id };
  }

  return {
    url: toPublicUrl(file.path),
    publicId: ''
  };
};

const uploadManyImages = async (files = []) => {
  const uploads = await Promise.all(files.map((file) => uploadSingleImage(file)));
  return uploads.filter(Boolean);
};

module.exports = {
  uploadSingleImage,
  uploadManyImages
};
