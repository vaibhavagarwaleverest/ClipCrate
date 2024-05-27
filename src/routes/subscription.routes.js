import { toggleSubscription } from "../controllers/subscription.controller.js";
import { getSubscribedChannels } from "../controllers/subscription.controller.js";
import { getUserChannelSubscribers } from "../controllers/subscription.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

import { Router } from "express";
const router = Router();

router.route("/toggleSubscription/:channelId").post(auth,toggleSubscription);
router.route("/getSubscribedChannels/:subscriberId").get(auth,getSubscribedChannels)
router.route("/getUserChannelSubscribers/:channelId").get(auth,getUserChannelSubscribers)

export default router;