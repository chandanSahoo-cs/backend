import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String,
            required : [true,"video file is required"],
        },
        thumbnail : {
            type :String,
            required :[true, "thumbnail is required"]
        },
        title : {
            type : String,
            required : [true, "title is required"]
        },
        description : {
            type : String,
            required : [true, "description is required"]
        },
        duration : {
            type : Number,
            required : [true, "title is required"]
        },
        views : {
            type : Number,
            default : 0,
        },
        isPublished : {
            type : Boolean,
            default :true,
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps : true}
);

export const Video = mongoose.model("Video", videoSchema);
