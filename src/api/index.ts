import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import emojis from "./emojis";
import auth from "./auth";

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/auth", auth);
import rooms from "./rooms";
router.use("/rooms", rooms);
import ai from "./ai";
router.use("/ai", ai);
import poll from "./poll";
router.use("/poll", poll);
import vote from "./vote";
router.use("/vote", vote);

export default router;
