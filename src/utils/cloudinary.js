import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
console.log("APIkEY",process.env.CLOUD_API_KEY);
cloudinary.config({
  cloud_name: 'dcati3vrz',
  api_key: '686984417487833',
  api_secret: 'GPl_cXQ7tZOSk0NjJOzbZvqyoWU',
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
