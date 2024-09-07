import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No local file path provided");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",  // Auto-detect the file type (image, video, etc.)
        });

        console.log("File successfully uploaded to Cloudinary:", response.url);
        fs.unlinkSync(localFilePath)
        return response.url;  // Return only the URL
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        // Try to remove the local file
        try {
            fs.unlinkSync(localFilePath);
            console.log("Local temp file removed:", localFilePath);
        } catch (fsError) {
            console.error("Error removing local file:", fsError);
        }

        return null;  // Return null on failure
    }
};

export { uploadOnCloudinary };
