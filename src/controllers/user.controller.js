import asyncHandlers  from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Users } from "../models/users.model.js";
import { CloudinaryUpload } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await Users.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
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
    throw new ApiError(400, "Avatar File is Required1");
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

  const createdUser = await Users.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
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

  const user = await Users.findOne({ username: username }).exec();
  if (!user) {
    throw new ApiError(400, "User does'nt existed");
  }

  const isMatched = await user.isPasswordCorrect(password);
  if (!isMatched) {
    throw new ApiError(400, "Password Should Be Correct");
  }

  const user_id = user._id;

  const { accessToken, refreshToken } =
    await generateAccessAndRefereshTokens(user_id);
  

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
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new ApiResponse(200, {}, "User is SuccessFully Logged out"));
});

const changePassword = asyncHandlers(async (req, res) => {
  try {
    const user_id = req.user?._id;
  
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Enter Required Fields");
    }
    const user = await Users.findById(user_id);
    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const match = await user.isPasswordCorrect(oldPassword);

    if (!match) {
      throw new ApiError(403, "Incorrect Password");
    }
    user.password = newPassword;
    user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Password has Been Changed Successfully"));
  } catch (error) {
    
    throw new ApiError(401, error, "Something went wrong");
  }
});

const accessRefreshToken = asyncHandlers(async (req, res) => {
  try {
    const token = req.cookies?.refresh_token || req.body.refresh_token;
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodeRefreshToken = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user_id = decodeRefreshToken._id;
    const user = await Users.findById(user_id).select(
      " -refreshToken -password"
    );
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (token !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token has been Expired Kindly login");
    }
    options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      generateAccessAndRefereshTokens(user_id);

    res
      .status(200)
      .cookie("access_token", accessToken)
      .cookie("refresh_token", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const updateDetails = asyncHandlers(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }
  const { username, email, fullName } = req.body;
  if (!username || !email || !fullName) {
    throw new ApiError(401, "Fields Should not be empty");
  }
  const updatedUser = await Users.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        username: username,
        email: email,
        fullName: fullName,
      },
    },
    {
      new: true,
    }
  ).select("-refreshToken -password");
  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Details Updated Successfully"));
});
const updateAvatar = asyncHandlers(async (req, res) => {
  try {
    let user_id = req.user?._id;

    const newAvatarLocalPath = req.files.avatar[0].path;

    if (!newAvatarLocalPath) {
      throw new ApiError(401, "file should not be empty");
    }

    const response = await CloudinaryUpload(newAvatarLocalPath);

    if (!response) {
      throw new ApiError(401, "File has not uploaded to cloudianry server");
    }

    const updateAvatarUser = await Users.findByIdAndUpdate(
      user_id,
      {
        $set: {
          avatar: response.url,
        },
      },
      {
        new: true,
      }
    ).select(" -password ");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updateAvatarUser,
          "Avatar has been updated Successfully"
        )
      );
  } catch (error) {
    
    throw new ApiError(401, "Something went wrong");
  }
});
const updateCoverImage = asyncHandlers(async (req, res) => {
  try {
    const user_id = req.user?._id;

    const newCoverImagePath = req.files.coverImage[0].path;
    if (!newCoverImagePath) {
      throw new ApiError(401, "Path is missing");
    }
    const uploadCoverImage = await CloudinaryUpload(newCoverImagePath);

    if (!uploadCoverImage) {
      throw new ApiError(401, "File is Not uploaded to Cludianry");
    }
    const updateCoverImageUser = await Users.findByIdAndUpdate(
      user_id,
      {
        $set: {
          coverImage: uploadCoverImage.url,
        },
      },
      {
        new: true,
      }
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updateCoverImageUser,
          "Cover Image has been updated Successfully"
        )
      );
  } catch (error) {
  
  }
});

const getChannelProile= asyncHandlers(async(req,res)=>{
  const {username}=req.params 

  if(!username?.trim())
  {
      throw new ApiError(400,"Usenrame not found")
  }

  const channel= await Users.aggregate([
  {
    $match:{
      username:username
    }
  },
  {
    $lookup:{
      from:"subscription",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    }
  },
  {
    $lookup :
    {
      from:"subscription",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribedTo"
    }

  }
  ,
  {
    $addFields:{
      subscribersCount:{
        $size:"$subscribers"
      },
      channelSubscribedToCount:{
        $size:"$subscribedTo"
      },
      isSubscribed:
      {
        $cond:{
          $if:{$in:[req.user?._id,"$subcribers.subscriber"]},
          then:true,
          else:false  
        }
      }

    }


  }
  ,{
    $project:{
      fullName:1,
      username:1,
      email:1,
      avatar:1,
      coverImage:1,
      subscribersCount:1,
      channelSubscribedToCount:1,
      isSubscribed:1
    }
  }

]
)
if(!channel?.length)
  {
    throw new ApiError(400,"channel does not exist")

  }
  
  res.status(200).json(
    new ApiResponse(200,channel[0],"User Channel Fetched Successfully")

  )

  })

const getWatchHistory= asyncHandlers(async(req,res)=>
{
  const id=req.user._id
  const user= await Users.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {

      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:
        [
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                  $first: "$owner"
              }
          }
          }
        ]


      }

    }
])

return res.status(200).json(
  new ApiResponse(200,user[0].watchHistory,"Watch History Fetched Successfully")
)
}
)

export {
  registerUser,
  loginUser,
  logOutUser,
  accessRefreshToken,
  changePassword,
  updateDetails,
  updateAvatar,
  updateCoverImage,
  getChannelProile,
  getWatchHistory
};
