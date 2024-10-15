import { asyncHandler } from "../utils/asyncHandler.js";
import { userType } from "../types.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const createPayload = req.body;
  const parsePayload = userType.safeParse(createPayload);

  if (!parsePayload.success) {
    const usernameError = parsePayload.error.formErrors.fieldErrors.username;
    const emailError = parsePayload.error.formErrors.fieldErrors.email;
    const fullNameError = parsePayload.error.formErrors.fieldErrors.fullName;
    const passwordError = parsePayload.error.formErrors.fieldErrors.password;

    if (usernameError) throw new apiError(400, usernameError[0]);
    if (emailError) throw new apiError(400, emailError[0]);
    if (fullNameError) throw new apiError(400, fullNameError[0]);
    if (passwordError) throw new apiError(400, passwordError[0]);
  }

  const { username, email, fullName, password } = createPayload;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    if (existedUser.username === username && existedUser.email === email) {
      throw new apiError(
        409,
        "User with the same username and email already exists."
      );
    } else if (existedUser.email === email) {
      throw new apiError(409, "Email is already registered.");
    } else if (existedUser.username === username) {
      throw new apiError(409, "Username is already taken.");
    }
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required.");
  }

  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarUrl) {
    throw new apiError(400, "Failed to upload avatar.");
  }

  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatarUrl,
    coverImage: coverImageUrl || "",
  });

  const createdNewUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdNewUser) {
    throw new apiError(500, "Something went wrong while registering the user.");
  }

  res
    .status(201)
    .json(
      new apiResponse(200, createdNewUser, "User registered successfully.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  /*TODO: req body -> data
  username or email
  find the user
  password check - > if wrong { wrong password} & if correct {send access token and referesht token}
  */
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //*Depends if query is taking more time update the existing else make a query

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshtoken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  /* TODO: clear cookie
  -> clear refreshToken
  */
 User.findByIdAndUpdate(
  await req.user._id,
  {
    $set: {
      refreshToken : undefined
    }
  },
  {
    new: true
  }
 )

 const options = {
  httpOnly: true,
  secure : true
 }
 return res.status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new apiResponse(200, {}, "User Logged Out"))
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apiError(401 , "Unauthorized Request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken._id)
  
    if(!user){
      throw new apiError(401,"Invalid Refresh token")
    }
  
    if(incomingRefreshToken!==user.refreshToken){
      throw new apiError(401,"Refresh token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshtoken", newRefreshToken,options)
    .json(
      new apiResponse(
        200,
        {accessToken,newRefreshToken}
      )
    )
  } catch (error) {
    throw new apiError(401, "Invalid Refresh Token")
  }
})

export { registerUser,loginUser,logoutUser,refreshAccessToken };
