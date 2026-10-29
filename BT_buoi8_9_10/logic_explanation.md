# 🕒 Giải Thích Chi Tiết Cơ Chế Hoạt Động Của `new Date().getHours()`

Tài liệu này giải thích cách hoạt động của đối tượng `Date` và phương thức `.getHours()` trong JavaScript được sử dụng để xây dựng tính năng **Lời chào thông minh theo thời gian thực** trên website **MangaRealm**.

---

## 1. Bản chất của `new Date()` trong JavaScript

Trong JavaScript, `new Date()` là cú pháp khởi tạo một **đối tượng Date** biểu diễn thời điểm hiện tại:

```javascript
const now = new Date();
```

### Đặc điểm quan trọng:
- **Lấy thời gian từ thiết bị người dùng (Client-side):** `new Date()` đọc trực tiếp đồng hồ hệ thống trên máy tính hoặc điện thoại của người truy cập, không phụ thuộc vào đồng hồ của máy chủ (Server).
- **Tự động theo múi giờ địa phương (Local Timezone):** Nếu người dùng ở Việt Nam (GMT+7), nó sẽ lấy giờ Việt Nam; nếu người dùng ở Nhật Bản (GMT+9) hay Mỹ (GMT-5), nó tự động lấy giờ tương ứng tại nơi họ đang sinh sống.
- **Hoạt động tức thì:** Không cần gửi yêu cầu qua mạng (Network request), tốc độ xử lý là 0 mili-giây và chạy tốt ngay cả khi ngoại tuyến (offline).

---

## 2. Phương thức `.getHours()` hoạt động như thế nào?

Sau khi có đối tượng `Date`, ta gọi phương thức `.getHours()`:

```javascript
const hour = now.getHours();
```

### Giá trị trả về:
- Phương thức này trả về **một số nguyên (integer)** nằm trong khoảng từ **`0` đến `23`**, đại diện cho giờ trong ngày theo hệ 24 giờ:
  - `0`: 12 giờ đêm (00:00)
  - `1`: 1 giờ sáng (01:00)
  - ...
  - `12`: 12 giờ trưa (12:00)
  - ...
  - `23`: 11 giờ đêm (23:00)

> **Lưu ý:** `.getHours()` chỉ trả về phần **giờ**, không bao gồm phút hay giây. Ví dụ: Lúc 15:45 thì `now.getHours()` sẽ trả về đúng số nguyên `15`.

---

## 3. Ứng dụng phân nhánh thời gian trong dự án MangaRealm

Trong file `script.js`, chúng ta sử dụng cấu trúc rẽ nhánh `if...else if...else` để chia 24 giờ trong ngày thành 5 khung giờ sinh hoạt tự nhiên của người Việt Nam:

```javascript
function initRealtimeGreeting() {
    const now = new Date();
    const hour = now.getHours(); // Lấy số nguyên từ 0 đến 23

    let icon = '✨';
    let title = '';
    let message = '';

    if (hour >= 5 && hour < 11) {
        // [05:00 - 10:59] BUỔI SÁNG
        icon = '🌅';
        title = 'Chào buổi sáng!';
        message = 'Chúc bạn một ngày mới tràn đầy năng lượng và tích cực!';
    } else if (hour >= 11 && hour < 14) {
        // [11:00 - 13:59] BUỔI TRƯA
        icon = '☀️';
        title = 'Chào buổi trưa!';
        message = 'Chúc bạn có thời gian nghỉ trưa thoải mái và bữa trưa ngon miệng!';
    } else if (hour >= 14 && hour < 18) {
        // [14:00 - 17:59] BUỔI CHIỀU
        icon = '🌤️';
        title = 'Chào buổi chiều!';
        message = 'Chúc bạn một buổi chiều làm việc và đọc truyện thật vui vẻ!';
    } else if (hour >= 18 && hour < 22) {
        // [18:00 - 21:59] BUỔI TỐI
        icon = '🌙';
        title = 'Chào buổi tối!';
        message = 'Chúc bạn có những phút giây thư giãn tuyệt vời sau một ngày dài!';
    } else {
        // [22:00 - 04:59] ĐÊM KHUYA
        icon = '🌌';
        title = 'Khuya rồi, cú đêm ơi!';
        message = 'Đọc truyện xong nhớ nghỉ ngơi sớm để giữ gìn sức khỏe bạn nhé!';
    }

    // Gán nội dung vào phần tử HTML của Toast
    document.getElementById('greeting-icon').textContent = icon;
    document.getElementById('greeting-title').textContent = title;
    document.getElementById('greeting-desc').textContent = message;
}
```

---

## 4. Bảng Tra Cứu Khung Giờ & Điều Kiện Logic

| Khung thời gian thực tế | Giá trị của `hour` | Biểu thức điều kiện trong Code | Lời chào hiển thị |
| :--- | :---: | :--- | :--- |
| **05:00 - 10:59** | `5, 6, 7, 8, 9, 10` | `hour >= 5 && hour < 11` | 🌅 Chào buổi sáng! |
| **11:00 - 13:59** | `11, 12, 13` | `hour >= 11 && hour < 14` | ☀️ Chào buổi trưa! |
| **14:00 - 17:59** | `14, 15, 16, 17` | `hour >= 14 && hour < 18` | 🌤️ Chào buổi chiều! |
| **18:00 - 21:59** | `18, 19, 20, 21` | `hour >= 18 && hour < 22` | 🌙 Chào buổi tối! |
| **22:00 - 04:59** | `22, 23, 0, 1, 2, 3, 4` | `else` (các trường hợp còn lại) | 🌌 Khuya rồi, cú đêm ơi! |

---

## 5. Mở Rộng: Các phương thức hữu ích khác của đối tượng `Date`

Nếu sau này bạn muốn làm thêm các tính năng nâng cao khác (như đếm ngược giờ ra mắt chương mới, hiển thị ngày đăng truyện), bạn có thể dùng các hàm tương tự:

| Phương thức | Ý nghĩa | Ví dụ giá trị trả về |
| :--- | :--- | :---: |
| `now.getMinutes()` | Lấy số phút | `0` đến `59` |
| `now.getSeconds()` | Lấy số giây | `0` đến `59` |
| `now.getDay()` | Lấy thứ trong tuần (`0`: Chủ Nhật, `1`: Thứ Hai...) | `0` đến `6` |
| `now.getDate()` | Lấy ngày trong tháng | `1` đến `31` |
| `now.getMonth()` | Lấy tháng (`0`: Tháng 1, `11`: Tháng 12) | `0` đến `11` |
| `now.getFullYear()` | Lấy năm đầy đủ (4 chữ số) | `2026` |
| `now.toLocaleTimeString('vi-VN')` | Chuỗi thời gian định dạng chuẩn Việt Nam | `"15:44:17"` |

---
*Tài liệu được tạo tự động cho dự án website **MangaRealm**.*
