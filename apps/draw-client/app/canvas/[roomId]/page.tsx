"use client";
import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas({ params }: { params: { roomId: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;

    initDraw(canvas, params.roomId);
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef} width={2000} height={1000}></canvas>
    </div>
  );
}
