import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };
export async function initDraw(canvas: HTMLCanvasElement, roomId: string) {
  const ctx = canvas.getContext("2d");

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  if (!ctx) {
    return;
  }

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX; // width of the rectangle
    const height = e.clientY - startY; // height of the rectangle
    existingShapes.push({
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    });
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startX; // width of the rectangle
      const height = e.clientY - startY; // height of the rectangle
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255, 255, 255)"; // white stroke
      ctx.strokeRect(startX, startY, width, height); // draw the rectangle
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
  ctx.fillStyle = "rgba(0,0,0)"; // black background
  ctx.fillRect(0, 0, canvas.width, canvas.height); // fill the canvas with the background color

  existingShapes.map((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(255, 255, 255)"; // white stroke
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId: string) {
  const response = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
  const messages = response.data.messages;
  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });
  return shapes;
}
