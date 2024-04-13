import { asyncHandlers } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Users } from "../models/users.model.js";
import { CloudinaryUpload } from "../utils/cloudinary.js";
const registerUser = asyncHandlers(async (req, res) => {
  // get user details from frontend
  // validations- not empty
  // check if user is already exist or not
  // check for image and avatar
  // uplad them to cloudinary , check for avatar
  // create user object- create entry in db
  // remove password and refresh token field from response
  //check for user creation
  // return response
  const { username, fullName, email, password } = req.body;
  if (
    username.trim().length == 0 ||
    fullName.trim().length == 0 ||
    email.trim().length == 0 ||
    password.trim().length == 0
  ) {
    console.log("Plase Fill all the Field");
    throw new ApiError(400, "Please Fill all the Fields");
  }
  const existedUser = await Users.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "Email and Username is already Exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const converImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const avatar = await CloudinaryUpload(avatarLocalPath);
  const coverImage = await CloudinaryUpload(converImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await Users.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
