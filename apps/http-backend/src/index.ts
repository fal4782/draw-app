import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { prismaClient } from "@repo/db/client";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }
  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email: parsedData.data.username },
    });

    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }

    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });

    res.json({ userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }

  try {
    // TODO: Compare hashed password
    const user = await prismaClient.user.findUnique({
      where: { email: parsedData.data.username },
    });

    if (!user) {
      res.status(404).json({ error: "User does not exist" });
      return;
    }

    if (user.password !== parsedData.data.password) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }

    try {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ token });
    } catch (jwtError) {
      res.status(500).json({ error: "Error generating token" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ error: "Invalid inputs" });
    return;
  }

  // @ts-ignore : TODO: Fix this
  const userId = req.userId;
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({ roomId: room.id });
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      res.status(409).json({ error: "Room with this name already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.listen(3200);
