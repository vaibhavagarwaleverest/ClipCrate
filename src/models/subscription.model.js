import mongoose from "mongoose";
import { Users } from "./users.model";
const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
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
