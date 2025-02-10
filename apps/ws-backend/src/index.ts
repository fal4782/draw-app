import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

// You can only send string or binary data over a WebSocket

const wss = new WebSocketServer({ port: 8080 });

// Approach 1:  Using a global variable to store the state (ugly but simple)
interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
wss.on("connection", (ws, request) => {
  const url = request.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (!userId) {
    ws.send("Invalid token");
    setTimeout(() => ws.close(), 100);
    return;
  }
  // Add the user to the global users array
  users.push({
    ws,
    rooms: [],
    userId,
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data as unknown as string);
    // Join room
    if (parsedData.type === "join_room") {
      const user = users.find((user) => user.ws === ws); // Find the user by their WebSocket connection in the global users array
      if (!user) {
        return;
      }
      user.rooms.push(parsedData.roomId); // Add the room ID to the user's rooms array
      console.log("User joined room:", parsedData.roomId);
    }

    // Leave room
    if (parsedData.type === "leave_room") {
      const user = users.find((user) => user.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((room) => room !== parsedData.roomId); // Remove the room ID from the user's rooms array
      console.log("User left room:", parsedData.roomId);
    }

    // Send message to room
    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      // Save the message to the database but this will make it slower so the idea approach is to use a queue and then a pipeline to process the messages
      await prismaClient.chat.create({
        data: {
          message,
          roomId,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            })
          );
          console.log("Message sent to room:", roomId);
        }
      });
    }
  });
});
