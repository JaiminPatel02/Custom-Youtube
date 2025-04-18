import { v2 as cloudinary } from "cloudinary"

const extractPublicId = (imageUrl) => {
    if (!imageUrl) return null
    const parts = imageUrl.split("/")
    const publicIdWithExtension = parts.slice(-1)[0]
    const publicId = publicIdWithExtension.split(".")[0]
    return publicId
}

const deleteFromCloudinary = async (imageUrl) => {
    try {
        const publicId = extractPublicId(imageUrl)
        if (!publicId) return
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error("Cloudinary deletion error:", error)
    }
}

export { deleteFromCloudinary }
