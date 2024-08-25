import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : [true, "username is required"],
            unique : true,
            lowercase : true,
            trim : true,
            index : true,
        },
        email : {
            type : String,
            required : [true, "email is required"],
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type : String,
            required : [true, "fullname is required"],
            trim : true,
            index : true,
        },
        avatar : {
            type : String,
            required : [true, "avatar is required"],
        },
        coverImage : {
            type : String,
        },
        watchHistory : {
            type : Schema.Types.ObjectId,
            ref : "Video",
        },
        password : {
            type : String,
            required : [true, "password is required"],
        },
        refreshToken : {
            type : String
        }
    },
    {timestamps : true}
);

export const User = mongoose.model("User", userSchema);
