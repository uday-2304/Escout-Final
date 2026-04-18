import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath, options = {}) => {
  if (!filePath) return null;

  const result = await cloudinary.uploader.upload(filePath, {
    folder: options.folder || "escout",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options,
  });

  return {
    url: result.secure_url || result.url,
    publicId: result.public_id,
    raw: result,
  };
};

export default cloudinary;