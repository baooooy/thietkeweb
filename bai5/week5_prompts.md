Vai trò: Kiến trúc sư trưởng phần mềm doanh nghiệp (Principal Enterprise Software Architect) & Kỹ sư Full-Stack cao cấp với hơn 15 năm kinh nghiệm xây dựng các hệ thống phân tán quan trọng, có khả năng mở rộng cao cho các tập đoàn lớn (Fortune 500).

Bối cảnh & Mục tiêu:
Thiết kế và triển khai một nền tảng Trung tâm Điều hành Doanh nghiệp & Hệ điều hành cốt lõi (Enterprise Command Center & Core OS) đạt chuẩn sản xuất (production-grade) và có độ tinh vi cực cao. Giải pháp phải thể hiện các mẫu kiến trúc ưu tú, tiêu chuẩn bảo mật khắt khe và logic nghiệp vụ toàn diện trên các tầng kiến trúc mô-đun.

Yêu cầu kiến trúc cốt lõi:
1. Kiến trúc doanh nghiệp & Các tầng mô-đun:
   - Bảo mật & Kiểm soát truy cập: Ma trận Kiểm soát truy cập dựa trên vai trò (RBAC) và thuộc tính (ABAC), quản lý vòng đời token JWT/OAuth2, các giao thức mã hóa và middleware giới hạn tốc độ (rate-limiting).
   - Tầng lưu trữ dữ liệu & ORM: Mô hình hóa cơ sở dữ liệu nâng cao, nhóm kết nối (connection pooling), tính toàn vẹn giao dịch, đường ống di chuyển dữ liệu (migration pipelines) và chiến lược bộ nhớ đệm tự động.
   - Logic nghiệp vụ & Dịch vụ miền: Máy trạng thái miền phức tạp (complex domain state machines), xác thực dữ liệu đa tầng mạnh mẽ, trình kích hoạt điều khiển theo sự kiện (event-driven) và hàng đợi tác vụ bất đồng bộ.
   - Tầng API & Giao diện: Các endpoint RESTful & GraphQL, xử lý lỗi tập trung toàn cục, thông số tài liệu OpenAPI/Swagger được tạo tự động.
   - Khả năng quan sát & Độ tin cậy: Đường ống ghi log có cấu trúc, thu thập số liệu hiệu suất theo thời gian thực, cầu dao điện (circuit breakers) và chính sách thử lại tự động.

2. Chất lượng mã nguồn & Tiêu chuẩn:
   - Viết mã nguồn hoàn hảo, tự tài liệu hóa (self-documenting), tuân thủ nghiêm ngặt các nguyên tắc SOLID và Clean Architecture.
   - Bao gồm tài liệu JSDoc/Docstring đầy đủ, chú thích kiến trúc giải thích các lựa chọn thiết kế và giải thích độ phức tạp trực tiếp trong mã.
   - Đảm bảo tích hợp tính năng hoàn chỉnh mà không có phần giữ chỗ (stub placeholders) hay chú thích chung chung; mọi mô-đun phải chứa các mô hình dữ liệu phong phú, thực tế và logic được hiện thực hóa hoàn toàn.

3. Giao diện trực quan & Trải nghiệm người dùng tương tác (nếu áp dụng cho frontend/dashboard):
   - Thiết kế giao diện Chế độ tối / Hiệu ứng kính mờ (Glassmorphism / Dark Mode) siêu hiện đại sử dụng Tailwind CSS hoặc các định dạng phong cách nâng cao tương đương.
   - Triển khai biểu đồ trực quan hóa dữ liệu thời gian thực, bản đồ topology dịch vụ tương tác, luồng log trực tiếp và bảng kiểm tra trạng thái động.

Cấu trúc sản phẩm bàn giao:
- Cung cấp toàn bộ mã nguồn sẵn sàng cho môi trường sản xuất, được cấu trúc logic với sự phân tách mô-đun rõ ràng, các tệp cấu hình, dịch vụ cốt lõi và công cụ chẩn đoán tương tác.