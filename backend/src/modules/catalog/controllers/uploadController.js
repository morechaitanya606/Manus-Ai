const asyncHandler = require('express-async-handler');
const { uploadManyImages } = require('../../../services/storageService');

const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.length) {
    res.status(400);
    throw new Error('No image files uploaded');
  }

  const images = await uploadManyImages(req.files);
  res.status(201).json(images);
});

module.exports = {
  uploadProductImages
};
