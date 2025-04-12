import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

    cloudinary.config({
        cloud_name: process.env.COULDNARY_CLOULD_NAME,
        api_key: process.env.COULDNARY_CLOULD_KEY,
        api_secret: process.env.COULDNARY_CLOULD_TOKEN
    });

const uploadOnClouldinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null
            // upload the file on clouldinary
          const responce = await  cloudinary.uploader.upload(localFilePath, /* upload oprions read from couldinary for upload file in which formet */ 
                {
                    resource_type:'auto'
                })
            // file has been uploaded Successfully
            console.log("File is Uploaded Successfully ". responce.url)
            return responce;
            
        } catch (error) {
            fs.unlinkSync(localFilePath) // remove the localy saved temp file as the upload operation failed

        }
    }



export {cloudinary}