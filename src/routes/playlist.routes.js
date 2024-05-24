import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller.js";
import { addVideoToPlaylist } from "../controllers/playlist.controller.js";
import { getUserPlaylists } from "../controllers/playlist.controller.js";
import { getPlaylistById } from "../controllers/playlist.controller.js";
import { removeVideoFromPlaylist } from "../controllers/playlist.controller.js";
import { deletePlaylist } from "../controllers/playlist.controller.js";
import { updatePlaylist } from "../controllers/playlist.controller.js";
const router=Router();

router.route("/createPlaylist").post(auth,createPlaylist);
router.route("/addVideoToPlaylist/:videoId/:playlistId").patch(auth,addVideoToPlaylist);
router.route("/getUserPlaylists/:userId").get(auth,getUserPlaylists);
router.route("/getPlayListById/:playlistId").get(auth,getPlaylistById)
router.route("/removeVideoFromPlaylist/:videoId/:playlistId").delete(auth,removeVideoFromPlaylist)
router.route("/deletePlaylist/:playlistId").delete(auth,deletePlaylist)
router.route("/updatePlaylist/:playlistId").patch(auth,updatePlaylist)
export default router