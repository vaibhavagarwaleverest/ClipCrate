import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { logOutUser } from "../controllers/user.controller.js";
import { changePassword } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { updateAvatar } from "../controllers/user.controller.js";
import { updateCoverImage } from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logOut").post(auth, logOutUser);
router.route("/changePassword").post(auth, changePassword);
router
  .route("/updateAvatar")
  .patch(auth, upload.fields([{ name: "avatar", maxCount: 1 }]), updateAvatar);
router
  .route("/updateCoverImage")
  .patch(
    auth,
    upload.fields({ name: "coverImage", maxCount: 1 }),
    updateCoverImage
  );

export default router;
