const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, folderPath) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folderPath, 
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;