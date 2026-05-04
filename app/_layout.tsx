import { Ionicons } from "@expo/vector-icons"; // Expo hỗ trợ sẵn icon này
import { Stack, usePathname, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";
import { theme } from "../styles/theme";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Danh sách các trang KHÔNG hiển thị nút Back
  const hideBackButton = ["/login", "/signup", "/index", "/"];

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6b9d" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: !hideBackButton.includes(pathname), // Tự động ẩn header ở 3 trang chính
        headerTitle: "", // Ẩn chữ tiêu đề trang để thoáng hơn
        headerTransparent: true, // Để nút Back đè lên nền của trang
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "white",
              padding: 8,
              borderRadius: 12, // Bo góc ô xung quanh
              marginLeft: 10,
              marginTop: 10,
              // Tạo đổ bóng nhẹ cho ô trắng nổi bật hơn
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Icon mũi tên nét đậm */}
            <Ionicons name="arrow-back" size={24} color="black" style={{ fontWeight: "bold" }} />
          </TouchableOpacity>
        ),
      }}
    >
      {/* Giữ nguyên các Screen của bạn */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Các trang còn lại sẽ tự động nhận header từ screenOptions ở trên */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="HeoDat" />
      <Stack.Screen name="GroupFunds" />
      <Stack.Screen name="AddFriends" />
      <Stack.Screen name="MessagesScreen" />
      <Stack.Screen name="Chatscreen" />
      <Stack.Screen name="CSKH" />
      <Stack.Screen name="add-transaction" />
      <Stack.Screen name="statistics/index" />
    </Stack>
  );
}