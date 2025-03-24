import { Image } from "react-native";
import { FC } from "react";
import { cn } from "@/utils/cn"

interface AvatarProps {
  source: string;
  size?: number;
  className?: string;
}

const Avatar: FC<AvatarProps> = ({ source, size = 50, className }) => {
  return (
    <Image
      source={{ uri: source }}
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
};

export default Avatar;
