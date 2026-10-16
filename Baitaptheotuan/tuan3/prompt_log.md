# 🤖 Nhật ký Prompt AI - CSS Layout Tuần 3 (Quản lý chi tiêu)

## 1. Prompt tạo bố cục Dashboard tổng thể
- **Công cụ:** Gemini / GitHub Copilot
- **Câu lệnh Prompt:**
  > "Hãy viết mã CSS sử dụng CSS Grid để tạo layout Dashboard quản lý chi tiêu gồm 2 cột: Sidebar cố định bên trái rộng 260px và Main Content bên phải chiếm phần còn lại. Vùng Main Content chứa một lưới 3 cột (stats-grid) cho các thẻ thống kê tài chính. Sử dụng CSS Variables cho màu sắc và khoảng cách (gap)."
- **Kết quả:** AI đã sinh ra cấu trúc Grid chính xác, không dùng float cũ, tối ưu hóa các thuộc tính `gap` và `grid-template-columns`.

## 2. Prompt tối ưu hóa & Debug lỗi tràn màn hình
- **Câu lệnh Prompt:**
  > "Đoạn mã CSS Grid của tôi đang bị tràn cuộn trang dọc. Hãy sửa lại bằng cách thêm thuộc tính `overflow-hidden` cho layout tổng và `overflow-y: auto` cho phần main-content."