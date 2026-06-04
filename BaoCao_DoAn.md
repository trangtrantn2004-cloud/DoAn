# BÁO CÁO ĐỒ ÁN: HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ TÍCH HỢP TRỢ LÝ TRÍ TUỆ NHÂN TẠO (NERO COFFEE)

---

## Chương 1. Cơ sở lý thuyết

### 1.1 Công nghệ Frontend (Phía máy khách)
- **ReactJS & TypeScript (Vite)**: Công nghệ cốt lõi xây dựng giao diện người dùng theo component. Sử dụng TypeScript để kiểm soát kiểu dữ liệu nghiêm ngặt, hạn chế rủi ro runtime. Vite hỗ trợ biên dịch và Hot-Module Repalcement siêu tốc.
- **Context API & React Hooks**: Quản lý trạng thái chia sẻ toàn cục (Global State) điển hình như Giỏ Hàng (`CartContext`), Phiên Đăng Nhập mà không cần dùng thư viện phụ thuộc cồng kềnh (Redux).
- **Socket.IO Client**: SDK kết nối thời gian thực bằng WebSocket giúp giao diện cập nhật trạng thái đơn hàng và hiển thị popup thông báo (Toast) ngay lập tức khi phát sinh sự kiện từ Server.
- **Web Speech API**: Tích hợp module SpeechRecognition của trình duyệt cho phép thu nhận truy vấn giọng nói bằng Tiếng Việt của khách thao tác trực tiếp và phiên dịch thành văn bản (Speech-to-Text).

### 1.2 Công nghệ Backend (Phía máy chủ)
- **Node.js & Express.js**: Nền tảng server-side xử lý các API chuẩn RESTful, kiến trúc non-blocking I/O hiệu năng cao đảm bảo phục vụ các request gọi món liên tục.
- **Google Generative AI (Gemini Flash)**: Công nghệ LLM cực mạnh giúp hệ thống thấu hiểu ý định (Intent Parsing) ngôn ngữ tự nhiên. Ứng dụng để xây dựng Trợ lý "Nero AI Assistant", phân rã câu lệnh như "Cho 2 bạc xỉu ít đá" thành cấu trúc JSON hợp lệ và thêm trực tiếp vào CSDL thay vì rập khuôn lệnh truyền thống.
- **JSON Web Token (JWT)**: Hệ thống chứng thực không trạng thái (Stateless Authentication) mã hóa các claim xác thực người dùng (khách hoặc quản trị viên), bảo mật Endpoints cục bộ.
- **Socket.IO Server**: Triển khai kênh Socket TCP kết nối 2 chiều giữa Frontend (Khách & Thu ngân) để push các real-time Event.

### 1.3 Cơ sở dữ liệu
- **MySQL (với thư viện `mysql2`)**: Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu bền vững (sản phẩm, tài khoản, đơn hàng). Khả năng xử lý các Transaction và đảm bảo vẹn toàn dữ liệu.

---

## Chương 2. Khảo sát và phân tích hệ thống

### 2.1 Đặc tả tác nhân (Actors)
1. **Khách hàng**: Người ghé thăm website tại quán, quét QR mã bàn, hoặc khách vãng lai đặt đơn trực tuyến giao đi.
2. **Thu ngân / Quản lý (Admin)**: Người trực quầy tại quán, xử lý đơn nhận, thao tác dọn bàn, thu tiền, cũng như có quyền quản lý kho dữ liệu của quán.

### 2.2 Các Use-case của hệ thống

**Nhóm Use-case Khách Hàng:**
- *UC01 - Tìm kiếm & Xem Thực Đơn*: Khách xem các sản phẩm nổi bật, duyệt danh sách món theo dòng danh mục.
- *UC02 - Tư vấn Trực Tuyến qua AI (Nero Bot)*: Khách trò chuyện, hỏi AI về thành phần, nguyên liệu món ăn.
- *UC03 - Đặt Món Thông Minh AI (Cốt lõi)*: Khách ra lệnh bằng giọng nói hoặc gõ chữ (Ví dụ: "Tôi muốn 1 Trà Đào và 2 Latte"), AI phân tích và nhặt trực tiếp vào giỏ hàng.
- *UC04 - Quản Lý Giỏ Hàng*: Thêm, bớt số lượng tùy chỉnh bằng các control (`+`/`-`), kiểm tra tổng tiền.
- *UC05 - Thanh Toán Đơn (Checkout)*: Điền Form để xuất hóa đơn; tùy vào loại hình là **Giao Tận Nơi** (bắt buộc số điện thoại + Địa chỉ) hoặc **Dùng Tại Quán** (Chọn Số Bàn, loại trừ bàn đang có khách).
- *UC06 - Xác thực Người Dùng*: Đăng ký, Đăng nhập.

**Nhóm Use-case Quản Trị Viên (Admin):**
- *UC07 - Bảng Điều Khiển (Dashboard)*: Xem số liệu Thống kê Đơn Hàng (số đơn Hoàn thành, Chờ Xử Lý, Doanh Thu) và kiểm tra lọc theo ngày.
- *UC08 - Xử Lý Tiến Độ Đơn*: Cập nhật trạng thái đơn (Chờ Xử Lý ➔ Đang Pha Chế ➔ Hoàn Thuận ➔ Hủy).
- *UC09 - Thu ngân Quản lý Bàn*: Xem sơ đồ bàn trực quan trống hay kín chỗ. Bấm "Thanh Toán Khách" để xuất bill tính tổng món đã gọi của bàn đó và giải phóng trạng thái bàn.
- *UC10 - Thao tác Danh Mục Loại (Catalog)*: Thêm, Xóa Danh mục (Cà Phê, Trà, Bánh ngọt).
- *UC11 - Thao tác Quản Lý Sản Phẩm (CRUD)*: Thêm Sản Phẩm Mới (Upload Ảnh, Gắn vào Danh mục), Sửa Giá, Gắn thẻ "Sản Phẩm Nổi Bật".

---

## Chương 3. Thiết kế hệ thống

### 3.1 Thiết kế Kiến Trúc
Hệ thống tuân thủ kiến trúc phân tách độc lập (Decoupled Client-Server):
- Frontend giao tiếp thông qua Fetch HTTP REST (`/api/products`, `/api/orders`...).
- Middleware Interceptors đảm nhận mang Bearer Token mọi chu trình kết nối.
- Module AI đặt tại backend `/api/ai/parse-order`, lấy danh sách tên chuẩn từ Database truyền vào Prompt của Gemini, sau đó trả về mảng object JSON.

### 3.2 Thiết kế Cơ Sở Dữ Liệu (ERD thu gọn)
Hệ thống sử dụng các thực thể quan hệ sau:
1. **USERS**: `id` (PK), `name`, `email`, `password_hash`, `role` (Admin/Customer/Guest).
2. **CATEGORIES**: `id` (PK), `name` (Ví dụ: Cà Phê), `description`.
3. **PRODUCTS**: `id` (PK), `name`, `category_id` (FK), `price`, `description`, `image_url`, `is_featured` (Boolean định dạng danh sách ưu tiên chat).
4. **TABLES**: `id` (PK), `name` (VD: Bàn 5), `status` (Available/Occupied).
5. **ORDERS**: `id` (PK), `user_id` (FK-nullable), `total_price`, `order_type` (dine_in/delivery), `table_id` (FK-nullable), `shipping_address`, `customer_name`, `customer_phone`, `status` (pending/processing/completed).
6. **ORDER_ITEMS**: `id` (PK), `order_id` (FK), `product_id` (FK), `price_at_buy`, `quantity`.

*(Các mối ràng buộc Khóa Ngoại - FK cascade đảm bảo dọn sạch Order Item khi Order bị xóa hoặc xóa Danh mục sẽ cảnh báo logic Sản Phẩm).*

---

## Chương 4. Triển khai 

*(Phần này đóng vai trò hướng dẫn cài đặt và chạy bảo vệ thử nghiệm đồ án)*

### 4.1 Môi trường yêu cầu (Prerequisites)
- Trình thông dịch: Node.js (phiên bản >= 18.x).
- Hệ Quản Trị CSDL: MySQL Server (phiên bản >= 8.0) hoặc XAMPP Local.
- Package Manager: `pnpm` (Nhanh và tối ưu) hoặc `npm`.
- Tùy chọn Phụ do Client: Trình duyệt Chrome hoặc Edge bản mới nhất (Yêu cầu để dùng API nhận diện micro Voice-to-Text).

### 4.2 Cài đặt Hệ thống và Cơ sở dữ liệu
**Bước 1: Khởi tạo dữ liệu MySQL**
Chạy ứng dụng quản lý MySQL (HeidiSQL, DBeaver, hoặc MySQL CLI). Khởi động script mô phỏng lược đồ rỗng:
Tạo database có tên theo dự án `CREATE DATABASE coffee_shop_db;`
Khôi phục dữ liệu mẫu có thể thiết lập thông qua lệnh `node scripts/init_db.js` và `node scripts/seed.js` ở Backend.

**Bước 2: Cài đặt biến môi trường**
Tại thư mục `backend/`, copy file mẫu `.env.example` tạo một file `.env`, điều chỉnh thông tin:
```text
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=coffee_shop_db
JWT_SECRET=super_secret_key_cua_do_an
GEMINI_API_KEY=AIzaSyA_XXXXXXXXXXXXXXXXXXXXX
```

**Bước 3: Tải Dependencies**
Mở hai Terminal song song cho cả `frontend` và `backend`:
```bash
# Ở Terminal 1 (Backend)
cd backend
pnpm install

# Ở Terminal 2 (Frontend)
cd frontend
pnpm install
```

### 4.3 Khởi động Hệ thống
Lần lượt ở cả 2 Terminal:
```bash
pnpm dev
```
- Máy chủ sẽ chạy tại: `http://localhost:5000` (Backend - Cửa ngõ kết nối giao thức REST / WebSocket).
- Khách hàng (Client UI) sẽ chạy tại: `http://localhost:5173` (Truy cập bằng Chrome).

### 4.4 Các kịch bản Demo nghiệm thu tại buổi Bảo Vệ
**Kịch bản 1: AI Thấu Hiểu Lời Nói (Cốt Lõi Sáng Tạo)**
1. Mở trang chủ người dùng, góc bên phải nhấn Chatbot Nero AI.
2. Cấp quyền Micro, bấm `🎙️` và nói to rõ: *"Cho 1 cà phê đen và 2 trà đào"*.
3. **Kết quả**: Giao diện tự động phân tách ý định, đưa chuẩn xác 1 đen, 2 trà đào vào Giỏ Hàng thay vì phải bấm từng món bằng tay.

**Kịch bản 2: Xử lý Đơn tại Quán (Dine In) & Real-time (Thời gian thực)**
1. Chia màn hình trái (Thu Ngân /admin), màn hình phải (Khách hàng).
2. Khách chốt giỏ hàng chọn **"Thưởng thức tại quán"**. Khung Table Dropdown sẽ che đi các bàn đang chứa người. Chọn **"Bàn 1"**.
3. **Kết quả**: Ngay khi bấm Mua, Tab của Admin kêu tiếng Bíp vang lên 🔔 và highlight dòng Đơn Hàng mới nhảy vào.
4. Quản lý sang Tab "Quản Lý Bàn", Bàn 1 đã chuyển đỏ "Đang Có Khách". Quản lý nhấp "Xem bill và Thanh toán" ➔ Hoàn tất vòng lặp hệ thống khép kín.

**Kịch bản 3: Xử lý Đơn Giao Hàng & Validation Giỏ hàng**
1. Khách hàng tăng giảm (`+`/`-`) tự do số lượng ngay trong Popup Giỏ hàng. 
2. Khách quên số điện thoại, chọn **Giao Hàng Tận Nơi**. Hệ thống chặn lại ngăn ngừa lỗi dữ liệu. Khách điền Số ĐT hiển thị hóa đơn và Hoàn tất. Màn hình admin nảy Số đơn Giao Đi thành công.
