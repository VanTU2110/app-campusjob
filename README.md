# 📱 Ứng dụng Tìm Việc Làm Thêm Cho Sinh Viên (Mobile - Expo)

Ứng dụng mobile giúp sinh viên tìm kiếm công việc bán thời gian phù hợp với thời gian rảnh và kỹ năng của bản thân. Được xây dựng bằng React Native (Expo SDK 53) và sử dụng NativeWind để tối ưu giao diện.

---

## 🚀 Công nghệ sử dụng

- ⚛️ React Native (Expo SDK 53)
- 💨 NativeWind (Tailwind CSS cho React Native)
- ⛑️ TypeScript
- 🧭 Expo Router v3
- 📦 Axios
- 🔐 Context API (xử lý đăng nhập)
- 📱 AsyncStorage (lưu token)
- 🔔 Pusher / Socket (nếu có real-time)

---

## 🧩 Tính năng chính

- Đăng ký, đăng nhập
- Cập nhật hồ sơ sinh viên (họ tên, ngày sinh, trường, kỹ năng...)
- Tìm kiếm và xem chi tiết công việc
- Ứng tuyển công việc
- Quản lý danh sách ứng tuyển
- Nhận thông báo trạng thái ứng tuyển (nếu có)
- Điều hướng mượt mà với Expo Router

---

## 🗂️ Cấu trúc thư mục chính

/app
├── (auth) # Màn hình đăng nhập, đăng ký
├── (home) # Màn hình chính, danh sách việc làm
├── (profile) # Hồ sơ sinh viên
├── _layout.tsx # Cấu hình Expo Router
/components # Các component dùng chung
/constants # Hằng số, màu sắc, font
/context/AuthContext.tsx# Context xử lý đăng nhập
/services/api.ts # Cấu hình Axios
/types # TypeScript types

---

## 🛠️ Cài đặt và chạy ứng dụng

### Yêu cầu:
- Node.js >= 18
- Expo CLI
- Cài Expo Go (trên điện thoại) hoặc dùng Android/iOS simulator

### Các bước cài đặt:

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
npm install
npx expo start
📱 Sau đó quét QR bằng ứng dụng Expo Go trên điện thoại.

🧪 Môi trường phát triển
✅ Đã kiểm thử trên IOS

👨‍🎓 Sinh viên thực hiện
Họ tên: Phạm Văn Tú

Mã số sinh viên: 10121943

Lớp: 125215
