import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";

const app = express();

app.post("/signup", (req, res) => {
  // db call
  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }
  res.json({ userId: "134" });
});

app.post("/signin", (req, res) => {
  const data = SignInSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }
  const userId = 1;
  const token = jwt.sign({ userId }, JWT_SECRET);
  res.json({ token });
});

app.post("/room", middleware, (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }
  // db call
  res.json({ roomId: "1" });
});

app.listen(3200);
