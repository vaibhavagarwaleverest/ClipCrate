import mongoose from "mongoose";
import { Users } from "./users.model";
const subscriptionSchema = new mongoose.Schema(
  {
    subscribers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timeseries: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
