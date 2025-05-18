// app/(auth)/onboarding.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const slides: { title: string; description: string; animation: any; colors: [string, string] }[] = [
  {
    title: "Chào mừng đến với Job4Student",
    description: "Tìm công việc bán thời gian lý tưởng theo lịch học của bạn.",
    animation: require("../assets/lottie/Animation - 1747487268698.json"),
    colors: ["#6EE7B7", "#3B82F6"],
  },
  {
    title: "Cá nhân hoá theo kỹ năng",
    description: "Chỉ gợi ý những công việc bạn phù hợp.",
    animation: require("../assets/lottie/Animation - 1747487381186.json"),
    colors: ["#F472B6", "#FB923C"],
  },
  {
    title: "Ứng tuyển siêu nhanh",
    description: "Giao diện đơn giản, dễ thao tác cho sinh viên.",
    animation: require("../assets/lottie/Animation - 1747487439275.json"),
    colors: ["#A78BFA", "#38BDF8"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const currentSlide = slides[index];

  return (
    <LinearGradient
      colors={currentSlide.colors}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Carousel
        width={width}
        height={500}
        data={slides}
        onSnapToItem={setIndex}
        renderItem={({ item }) => (
          <View className="items-center justify-center px-6 mt-10">
            <LottieView
              source={item.animation}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            <Text className="text-white text-2xl font-bold text-center mb-2">{item.title}</Text>
            <Text className="text-white text-base text-center">{item.description}</Text>
          </View>
        )}
      />

      {/* Dot indicator */}
      <View className="flex-row justify-center mt-4 space-x-2">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </View>

      {/* Buttons */}
      <View className="px-6 mt-10">
        <Pressable
          onPress={() => router.push("/auth/login")}
          className="bg-white py-3 rounded-2xl mb-4"
        >
          <Text className="text-center text-base font-semibold text-blue-600">Đăng nhập</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/auth/register")}
          className="border-2 border-white py-3 rounded-2xl"
        >
          <Text className="text-center text-base font-semibold text-white">Đăng ký</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
