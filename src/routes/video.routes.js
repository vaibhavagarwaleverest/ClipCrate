import { getAllVideos } from "../controllers/video.controller.js";
import { publishAVideo } from "../controllers/video.controller.js";
import { getVideoById } from "../controllers/video.controller.js";
import { updateVideo } from "../controllers/video.controller.js";
import { deleteVideo } from "../controllers/video.controller.js";
import { togglePublishStatus } from "../controllers/video.controller.js";
import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/getAllVideos").get(auth,getAllVideos);
router.route("/publishAVideo").post(auth,upload.fields([{ name: "uploadVideo", maxCount: 1 },{
    name: "uploadThumbnail",
    maxCount: 1,
  }]),publishAVideo);
router.route("/getVideoById/:videoId").get(auth,getVideoById);
router.route("/updateVideo/:videoId").patch(auth,updateVideo);
router.route("/deleteVideo/:videoId").delete(auth,deleteVideo);
router.route("/togglePublishStatus/:videoId").patch(auth,togglePublishStatus);

// getAllVideos,
// publishAVideo,
// getVideoById,
// updateVideo,
// deleteVideo,
// togglePublishStatus

export default router;