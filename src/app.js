import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true,
  })
);

// defining API's

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commmentRouter from "./routes/comments.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/likes.routes.js";
import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments",commmentRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/playlist",playlistRouter);
export default app;
