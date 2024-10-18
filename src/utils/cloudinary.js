import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        //Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        //File has been uploaded successfully
        console.log('File uploaded successfully on cloudinary !');
        console.log(response.url);
        return response;


    } catch (err) {
        fs.unlinkSync(localFilePath);//remove the locally saved file temporary file as the upload operation is failed 
        console.log('Unable to upload file on cloudinary ', err);
        return null;

    }
}

export { uploadOnCloudinary };