import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload file
        let response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // successfully uploaded.
        console.log("Uploaded in cloudinary",
            response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//Remove the locally saved temporary file if the uploading get failed.
        return null;
    }
}
export default uploadOnCloudinary;
//  cloudinary.uploader.upload()