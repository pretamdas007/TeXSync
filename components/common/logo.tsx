import { FC } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <Link href="/" className={cn("font-bold", sizeClasses[size], className)}>
      <span className="text-red-600">TeX</span>
      <span className="text-gray-100">Sync</span>
    </Link>
  );
};