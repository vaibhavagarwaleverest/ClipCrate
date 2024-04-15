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
  console.log("here");
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
  console.log("here2");

  const existedUser = await Users.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "Email and Username is already Exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const converImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is Required1");
  }

  const avatar = await CloudinaryUpload(avatarLocalPath);
  const coverImage = await CloudinaryUpload(converImageLocalPath);
  console.log("Avatar", avatar);
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

  const createdUser = await Users.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  console.log("here1");
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandlers(async (req, res) => {
  // Take Username, Email, Password From Frontend
  // Check Vaildations (User exist Or Not)
  // Check Entered Password is Correct or Not
  // Generate access token and refresh Token
  // Provide access token to user and save refresh token to database

  const { username, password } = req.body;
  if (
    [username, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All Fields are Required");
  }
  console.log(username);

  const user = await Users.findOne({ username: username }).exec();
  if (!user) {
    throw new ApiError(400, "User does'nt existed");
  }

  const isMatched = await user.isPasswordCorrect(password);
  if (!isMatched) {
    throw new ApiError(400, "Password Should Be Correct");
  }

  const user_id = user._id;

  const { accessToken, refreshToken } = generateAccessandRefreshToken(user_id);
  const logged_in_user = await Users.findById(user_id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(new ApiResponse(200, logged_in_user, "Logged in successfully"));

  res.end();
});

const logOutUser = asyncHandlers(async (req, res) => {
  const user = req.user;
  await Users.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    http: true,
    secrue: true,
  };
  res
    .status(200)
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, {}, "User is SuccessFully Logged out"));
});

export { registerUser, loginUser, logOutUser };
