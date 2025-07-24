import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 10000,
});

// const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            //console.log("<!!!> file path was empty")
            return null;
        }
        //upload the file on cloudinary: 
        const result = await cloudinary.uploader.upload( localFilePath, { 
            resource_type: "auto"
        })
        .catch((err)=> {
            console.log("Error uploading to Cloudinary: ", err);
        })
        //file has been uploaded successfully
        // 
        fs.unlinkSync(localFilePath)
        return result;

    } catch (error) {

        // ∴ the file has been uploaded on the backend server but not on cloudinary
        fs.unlinkSync(localFilePath); //removes the locally saved temporary file as the upload failed SYNCHRONOUSLY
        console.log("Kuch to galat hai daya: ",error)
        console.log("filepath: ", localFilePath);
        
        
    }
}

export {uploadOnCloudinary}