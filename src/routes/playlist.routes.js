import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller.js";
import { addVideoToPlaylist } from "../controllers/playlist.controller.js";
import { getUserPlaylists } from "../controllers/playlist.controller.js";

const router=Router();

router.route("/createPlaylist").post(auth,createPlaylist);
router.route("/addVideoToPlaylist/:videoId/:playlistId").patch(auth,addVideoToPlaylist);
router.route("/getUserPlaylists/:userId").get(auth,getUserPlaylists);
export default router