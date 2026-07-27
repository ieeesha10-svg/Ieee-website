const cloudinary = require("../config/cloudinary");

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
  const publicId = originalName
    ? sanitizeFilename(
        resourceType === "raw"
          ? originalName
          : originalName.replace(/\.[^.]+$/, "")
      )
    : undefined;

  const dataUri = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folderPath,
    resource_type: resourceType,
    ...(publicId && { public_id: publicId }),
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;