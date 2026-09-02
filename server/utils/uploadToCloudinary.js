const cloudinary = require("../config/cloudinary");
const path = require("path");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const sanitizeFilename = (name) => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 200);
};

const uploadToCloudinary = async (fileBuffer, folderPath, mimetype, originalName) => {
  const resourceType = IMAGE_TYPES.includes(mimetype) ? "image" : "raw";
  
  let publicId = undefined;

  if (originalName) {
    
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext); 
    
    
    const sanitizedName = sanitizeFilename(nameWithoutExt);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    
    publicId = `${sanitizedName}_${uniqueSuffix}`;

  
    if (resourceType === "raw") {
      publicId += ext;
    }
  }

  const dataUri = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folderPath,
    resource_type: resourceType,
    ...(publicId && { public_id: publicId }),
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;