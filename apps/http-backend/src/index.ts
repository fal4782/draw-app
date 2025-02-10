import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET, SALT_ROUNDS } from "@repo/backend-common/config";
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

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(parsedData.data.password, SALT_ROUNDS);
    } catch (hashError) {
      res.status(500).json({ error: "Error hashing password" });
      return;
    }

    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: hashedPassword,
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
    const user = await prismaClient.user.findUnique({
      where: { email: parsedData.data.username },
    });

    if (!user) {
      res.status(404).json({ error: "User does not exist" });
      return;
    }

    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(
        parsedData.data.password,
        user.password
      );
    } catch (compareError) {
      res.status(500).json({ error: "Error comparing password" });
      return;
    }

    if (!passwordMatch) {
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

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  try {
    const room = await prismaClient.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "asc",
      },
      take: 50,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const room = await prismaClient.room.findUnique({
      where: {
        slug,
      },
    });
    console.log(room);

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json({
      room,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(3200, () => {
  console.log("Server is running on port 3200");
});
