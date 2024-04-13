import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const CloudinaryUpload = async function (localFilePath) {
  try {
    if (!localFilePath){ 
      return null;}

    const upload_response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(upload_response);
    fs.unlinkSync(localFilePath);
    return upload_response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export { CloudinaryUpload };
