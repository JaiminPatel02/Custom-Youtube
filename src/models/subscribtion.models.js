import mongoose, {Schema} from "mongoose";

const subscribtionSchema = new Schema({
     subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing  
            ref : "User"
    },
    channel: {
            type: Schema.Types.ObjectId, // one who is owner of "subscriber" subscribing  
            ref : "User"
    },


    
}, {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    })

export const Subscribtion = mongoose.model("Subscribtion", subscribtionSchema);