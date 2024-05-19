import { Router } from "express"
import { createTweet } from "../controllers/tweet.controller.js"
import { getUserTweets } from "../controllers/tweet.controller.js"
import { updateTweet } from "../controllers/tweet.controller.js"
import { deleteTweet } from "../controllers/tweet.controller.js"
import { auth } from "../middlewares/auth.middleware.js"
const router=Router();

router.route("/createTweet").post(auth,createTweet)
router.route("/getUserTweets/:userId").get(auth,getUserTweets)
router.route("/updateTweet/:tweetId").patch(auth,updateTweet)
router.route("/deleteTweet/:tweetId").delete(auth,deleteTweet)


export default router