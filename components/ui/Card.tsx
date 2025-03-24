import { View, Text } from "react-native";
import { FC, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card: FC<CardProps> = ({ children, title, className }) => {
  return (
    <View className={cn("bg-white shadow-md rounded-lg p-4", className)}>
      {title && <Text className="text-lg font-semibold mb-2">{title}</Text>}
      {children}
    </View>
  );
};

export default Card;
