import { View } from "react-native";
import { FC, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: FC<ContainerProps> = ({ children, className }) => {
  return <View className={cn("flex-1 px-4 py-4", className)}>{children}</View>;
};

export default Container;
