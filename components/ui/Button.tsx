import { Text, TouchableOpacity } from "react-native";
import { FC } from "react";

import { cn } from "@/utils/cn"; // Import hàm cn từ utils

interface ButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
}

const Button: FC<ButtonProps> = ({ title, onPress, className }) => {
  return (
    <TouchableOpacity
      className={cn(
        "bg-blue-500 px-4 py-2 rounded-lg items-center",
        className
      )}
      onPress={onPress}
    >
      <Text className="text-white font-semibold">{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
