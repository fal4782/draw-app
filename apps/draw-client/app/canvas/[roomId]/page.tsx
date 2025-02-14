"use client";
import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;

    initDraw(canvas);
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef} width={1080} height={1000}></canvas>
    </div>
  );
}
