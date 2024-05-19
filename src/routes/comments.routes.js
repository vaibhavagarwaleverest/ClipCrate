import { Router } from "express";
import { getVideoComments } from "../controllers/comment.controller.js";
import { addComment } from "../controllers/comment.controller.js";
import { updateComment } from "../controllers/comment.controller.js";
import { deleteComment } from "../controllers/comment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/getVideoComments/:videoId").get(auth,getVideoComments);
router.route("/addComment/:videoId").post(auth,addComment);
router.route("/updateComment/:commentId").patch(auth,updateComment);
router.route("/deleteComment/:commentId").delete(auth,deleteComment);
// getVideoComments, 
// addComment, 
// updateComment,
//  deleteComment
export default router