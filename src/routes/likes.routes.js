import { Router } from "express";
import { toggleVideoLike } from "../controllers/likes.controller.js";
import { toggleCommentLike } from "../controllers/likes.controller.js";
import { toggleTweetLike } from "../controllers/likes.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/toggleVideoLike/:videoId").patch(auth,toggleVideoLike);
router.route("/toggleCommentLike/:commentId").patch(auth,toggleCommentLike);
router.route("/toggleTweetLike/:tweetId").patch(auth,toggleTweetLike);
export default router;