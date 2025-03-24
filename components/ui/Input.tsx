import { TextInput } from "react-native";
import { FC } from "react";
import { cn } from "@/utils/cn";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const Input: FC<InputProps> = ({ value, onChangeText, placeholder, className }) => {
  return (
    <TextInput
      className={cn(
        "border border-gray-300 rounded-lg px-4 py-2 text-black",
        className
      )}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
    />
  );
};

export default Input;
