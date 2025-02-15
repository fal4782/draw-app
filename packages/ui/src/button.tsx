"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  variant: "primary" | "secondary" | "outline";
  children: ReactNode;
  className?: string;
  size: "lg" | "sm";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  size,
  variant,
  className,
  onClick,
  children,
  type = "button",
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={twMerge(
        `${variant === "primary" ? "bg-primary" : ""} ${size === "lg" ? "px-4 py-2" : "px-2 py-1"}`,
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
