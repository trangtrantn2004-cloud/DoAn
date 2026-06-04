# 🛠 HƯỚNG DẪN CÀI ĐẶT DỰ ÁN NERO COFFEE TRÊN MÁY MỚI

Tài liệu này hướng dẫn chi tiết các bước để thiết lập và chạy dự án **Nero Coffee** từ đầu trên một máy tính mới.

---

## 1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản 18.x trở lên ([Tải tại đây](https://nodejs.org/)).
- **MySQL / XAMPP**: Dùng để chạy Cơ sở dữ liệu ([Tải XAMPP tại đây](https://www.apachefriends.org/)).
- **Trình duyệt**: Chrome, Edge hoặc Firefox.

---

## 2. Các bước cài đặt

### Bước 1: Khởi động Cơ sở dữ liệu
1. Mở **XAMPP Control Panel**.
2. Start 2 dịch vụ: **Apache** và **MySQL**.
3. Truy cập vào `http://localhost/phpmyadmin`.
4. Tạo một Database mới tên là: `coffee_shop`.

### Bước 2: Cài đặt Backend
1. Mở terminal tại thư mục `backend`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` trong thư mục `backend` (nếu chưa có) và cấu hình như sau:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=coffee_shop
   JWT_SECRET=nero_coffee_secret_key_2024
   GEMINI_API_KEY=AIzaSyB... (Thay bằng key của bạn nếu muốn dùng chatbot)
   ```

### Bước 3: Import Dữ liệu (Database)
Có 2 cách để nạp dữ liệu:
- **Cách 1 (Nhanh nhất)**: Tại `phpMyAdmin`, chọn database `coffee_shop` -> chọn **Import** -> Chọn file `backend/coffee_shop_full.sql` -> Bấm **Go**.
- **Cách 2 (Dùng lệnh)**:
  ```bash
  node scripts/init_db.js
  node scripts/seed_data.js
  node scripts/import_100_products.js
  node scripts/update_prices.js
  ```

### Bước 4: Cài đặt Frontend
1. Mở terminal mới tại thư mục `frontend`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```

---

## 3. Chạy ứng dụng

### 1. Chạy Backend
Tại thư mục `backend`, chạy:
```bash
npm run dev
```
(Server sẽ chạy tại: `http://localhost:5000`)

### 2. Chạy Frontend
Tại thư mục `frontend`, chạy:
```bash
npm run dev
```
(Ứng dụng sẽ chạy tại: `http://localhost:5173`)

---

## 4. Tài khoản Đăng nhập Hệ thống

Để kiểm tra các chức năng, bạn có thể dùng các tài khoản mẫu sau:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị (Admin)** | `admin@coffee.com` | `admin123` |
| **Khách hàng (User)**| `an@gmail.com` | `123456` |

---

## 5. Lưu ý quan trọng
- **Chatbot AI**: Để tính năng đặt món bằng giọng nói hoạt động, bạn cần đảm bảo `GEMINI_API_KEY` trong file `.env` còn hiệu lực.
- **Hình ảnh**: Hệ thống sử dụng link ảnh online từ Unsplash, nên máy tính cần có **kết nối Internet** để hiển thị đầy đủ hình ảnh sản phẩm.
- **Socket.IO**: Nếu Admin không nhận được thông báo đơn hàng mới, hãy kiểm tra xem Backend đã khởi động đúng cổng 5000 chưa.

---
**Chúc bạn cài đặt thành công!** ☕🚀
