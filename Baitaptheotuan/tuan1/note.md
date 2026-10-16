HOẠT ĐỘNG 1: Kiểm tra & Đồng bộ môi trường
# 1. Kiểm tra phiên bản Git
git --version

# 2. Cấu hình thông tin cá nhân trên Git (Dùng email/username tạo tài khoản GitHub)
git config --global user.name "Tên Của Bạn"
git config --global user.email "email_github_cua_ban@gmail.com"

# 3. Kiểm tra lại cấu hình
git config --list
HOẠT ĐỘNG 2: Thử thách "Git nhanh" - Xây biệt thự Web
*Cách đẩy code lên github
git init
git add .
git commit -m "Chore: Khởi tạo khung HTML Quản lý chi tiêu"
git branch -M main
git remote add origin <URL_REPOSITORY_LEADER>
git push -u origin main

👥 Bước 2: Member A & B Clone và Tạo nhánh Feature
# Clone dự án về máy
git clone <URL_REPOSITORY_LEADER>
cd <TEN_THU_MUC_PROJECT>

# Tạo và chuyển sang nhánh riêng
# Member A:
git checkout -b feature/thu-nhap
Sửa đoạn <div id="thu-nhap"> trong index.html:
<div id="thu-nhap">
    <h2>Tổng Thu Nhập: 10,000,000 VNĐ</h2>
</div>
Thực hiện commit & push
git add index.html
git commit -m "Feat: Thêm khối hiển thị thu nhập"
git push origin feature/thu-nhap
(Leader thực hiện Merge feature/thu-nhap vào main trên GitHub).

Member B (Làm phần Chi Tiêu):
git checkout -b feature/chi-tieu
Bước 3: Tạo & Xử lý Merge Conflict (Xung đột)
Member B sửa đoạn <div id="thu-nhap"> (vốn là phần Member A đã làm) thay vì sửa phần chi tiêu:
<div id="thu-nhap">
    <h2>Tổng Thu Nhập Tháng 10: 12,000,000 VNĐ</h2>
</div>
Member B commit và pull code mới nhất từ main về để chuẩn bị merge:
git add index.html
git commit -m "Feat: Cập nhật thông tin thu nhập theo tháng"
git fetch origin
git merge origin/main

VS Code báo Conflict đỏ!

Giải quyết: Member B trao đổi với Leader, chọn Accept Both Changes (Giữ cả hai) trên giao diện VS Code, sau đó hoàn tất:
git add index.html
git commit -m "Fix: Giải quyết xung đột phần thu nhập"
git push origin feature/chi-tieu
