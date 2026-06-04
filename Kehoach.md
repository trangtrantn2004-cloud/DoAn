# Kế hoạch dự án: Website Bán Hàng Trực Tuyến Cho Quán Cà Phê

## 1. Mục tiêu dự án
- Xây dựng website bán hàng trực tuyến cho quán cà phê.
- Cung cấp chức năng cho người dùng (khách hàng): xem mục menu, thông tin chi tiết sản phẩm, đặt hàng, thanh toán.
- Xây dựng hệ thống trang quản trị (Admin Panel) giúp quản lý sản phẩm, danh mục, đơn hàng và người dùng.

## 2. Các giai đoạn triển khai chi tiết

### Giai đoạn 1: Khảo sát và Phân tích Yêu cầu
- **1.1** Có kết quả khảo sát quy trình nghiệp vụ thực tế trong hoạt động bán hàng của quán cà phê (từ khâu đặt đồ uống, thanh toán đến xử lý đơn hàng). Có sơ đồ quy trình nghiệp vụ BPMN và mô tả chi tiết quy trình.
- **1.2** Có bảng yêu cầu chức năng chi tiết phù hợp với hệ thống website e-commerce (giỏ hàng, quản lý đơn đặt, tìm kiếm sản phẩm). Có bảng yêu cầu phi chức năng chi tiết (hiệu năng, độ trễ, bảo mật người dùng).
- **1.3** Có sơ đồ Use Case (UC) tổng quát vẽ đúng chuẩn với ít nhất 5 UC chính: **Quản lý sản phẩm, Quản lý danh mục, Quản lý đơn hàng, Quản lý người dùng (khách hàng), Đặt hàng và tính tiền**. Có bản đặc tả chi tiết cho từng UC.

### Giai đoạn 2: Thiết kế Hệ thống
- **2.1** Có sơ đồ lớp thực thể (Class Diagram) phù hợp bài toán website bán hàng. Có sơ đồ cơ sở dữ liệu (ERD) phù hợp với sơ đồ lớp thực thể đã tạo.
- **2.2** Có bản thiết kế kiến trúc bằng UML thể hiện được kiến trúc chung của website (vd: mô hình MVC, Client-Server hoặc SOA nếu tách rời Frontend/Backend).
- **2.3** Có các bản thiết kế mockup UI/UX cho các giao diện chính (Trang chủ mua sắm, Chi tiết sản phẩm, Giỏ hàng, Giao diện Dashboard Admin) sử dụng Figma.

### Giai đoạn 3: Phát triển và Xây dựng phần mềm
- **3.1** Xây dựng thành công cơ sở dữ liệu hoàn chỉnh trên MySQL (hoặc các hệ quản trị CSDL tương đương).
- **3.2** Xây dựng các thành phần của hệ thống: Server (Backend Web API) và Client (Website người dùng và Ứng dụng Mobile).
- **3.3** Thi công lập trình các chức năng đáp ứng đúng 5 UC chính theo như bản thiết kế.
- **3.4** Thi công được hệ thống tính năng thông minh, ví dụ AI Chatbot hỗ trợ tự động tư vấn đồ uống hoặc giải đáp thắc mắc cho người mua hàng.

### Giai đoạn 4: Triển khai và Kiểm đánh
- **4.1** Triển khai ứng dụng server lên môi trường IIS hoặc Apache công khai trên internet với cấu hình bảo mật cơ bản. Ứng dụng mobile cài đặt cho người dùng được đóng gói thành file APK.
