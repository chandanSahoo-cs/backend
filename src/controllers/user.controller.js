import { asyncHandler } from "../utils/asyncHandler.js";
import { userType } from "../types.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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

export { registerUser };
