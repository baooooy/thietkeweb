# 📘 DOM Interaction — Tài Liệu Mô Tả Các Sự Kiện (Events) Đã Sử Dụng

Tài liệu này mô tả toàn bộ các **sự kiện JavaScript (DOM Events)** được sử dụng trong dự án **MangaRealm**, bao gồm nơi đăng ký, cách hoạt động và mục đích của từng sự kiện.

---

## 1. Tổng Quan Các Sự Kiện

| Sự kiện | Phần tử lắng nghe | Tính năng | File |
|---|---|---|---|
| `DOMContentLoaded` | `document` | Khởi tạo toàn bộ ứng dụng | `script.js` |
| `click` | Nút "Liên Hệ Ngay" `#open-contact-modal` | Mở Modal | `script.js` |
| `click` | Nút đóng `#close-modal-btn` | Đóng Modal | `script.js` |
| `click` | Nút "Hủy bỏ" `#cancel-modal-btn` | Đóng Modal | `script.js` |
| `click` | Lớp phủ `.modal-overlay` | Đóng Modal khi click ngoài | `script.js` |
| `keydown` | `document` | Nhấn phím ESC để đóng Modal | `script.js` |
| `submit` | Form `#contact-form` | Xử lý gửi form, chặn tải lại trang | `script.js` |
| `click` | Nút toggle `#toggle-btn` | Đổi chế độ Sáng/Tối | `script.js` |
| `click` | Biểu tượng ☀️🌙 `#theme-icon` | Đổi chế độ Sáng/Tối (click icon) | `script.js` |
| `click` | Nút đóng Toast `#toastCloseBtn` | Đóng thông báo chào mừng | `script.js` |
| `click` | Nút Bookmark `.bookmark-btn` | Lưu/bỏ yêu thích truyện | `script.js` |
| `input` | Ô nhập liệu `#text-input` | Hiển thị văn bản theo thời gian thực | `script.js` |

---

## 2. Chi Tiết Từng Sự Kiện

---

### 📌 `DOMContentLoaded`

```javascript
document.addEventListener('DOMContentLoaded', () => { ... });
```

**Phần tử lắng nghe:** `document`

**Khi nào kích hoạt?**
Kích hoạt ngay khi trình duyệt **đã tải và phân tích xong toàn bộ cây DOM** (HTML), kể cả trước khi các tài nguyên như ảnh, CSS từ CDN hoàn tất tải về.

**Tại sao dùng thay vì `window.load`?**
`window.load` chờ toàn bộ tài nguyên (ảnh, font, CSS CDN) tải xong mới chạy. Nếu mạng chậm, toàn bộ JS sẽ bị trì hoãn. `DOMContentLoaded` đảm bảo JS chạy sớm nhất có thể ngay khi DOM sẵn sàng.

**Mục đích trong dự án:**
Khởi tạo chuỗi các tính năng:
1. `renderProductList()` — Sinh danh sách truyện
2. `AOS.init()` — Hiệu ứng cuộn
3. `initRealtimeGreeting()` — Thông báo chào mừng
4. `initBulbToggle()` — Dark mode
5. `initLiveInput()` — Live text preview
6. `initContactModal()` — Modal liên hệ

---

### 📌 `click`

```javascript
element.addEventListener('click', function(event) { ... });
```

**Khi nào kích hoạt?**
Khi người dùng **nhấn và thả chuột trái** (hoặc nhấn phím Enter/Space khi phần tử đang được focus trên bàn phím) trên phần tử đó.

**Các trường hợp sử dụng trong dự án:**

| Phần tử | Hành động |
|---|---|
| `#open-contact-modal` | Gọi `openModal()` — thêm class `.is-open` vào Modal |
| `#close-modal-btn` (nút ✕) | Gọi `closeModal()` — xóa class `.is-open` khỏi Modal |
| `#cancel-modal-btn` (nút Hủy bỏ) | Gọi `closeModal()` |
| `.modal-overlay` | Đóng Modal **chỉ khi** `event.target === modal` (click đúng vào nền tối, không phải nội dung bên trong) |
| `#toggle-btn` | Chuyển đổi chế độ Sáng/Tối bằng cách thay `backgroundColor` của body |
| `#theme-icon` | Kích hoạt `toggleBtn.click()` — uỷ quyền cho nút chính xử lý |
| `#toastCloseBtn` | Gọi `closeToast()` — xóa class `.show` khỏi Toast |
| `.bookmark-btn` | Gọi `toggleBookmark()` — thêm/xóa class `.active`, đổi icon |

**Ghi chú quan trọng:** Khi cần kiểm tra click ra ngoài Modal, so sánh `event.target` với chính phần tử overlay:
```javascript
modal.addEventListener('click', function(event) {
    if (event.target === modal) { // chỉ đóng khi click đúng nền tối
        closeModal();
    }
});
```

---

### 📌 `keydown`

```javascript
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
    }
});
```

**Phần tử lắng nghe:** `document` (toàn bộ trang)

**Khi nào kích hoạt?**
Kích hoạt mỗi khi người dùng **nhấn bất kỳ phím nào** trên bàn phím (ngay lúc nhấn xuống, trước khi thả).

**Thuộc tính quan trọng:**
- `event.key` — chuỗi tên phím, ví dụ: `"Escape"`, `"Enter"`, `"ArrowUp"`, `"a"`, `"A"`
- `event.code` — mã vật lý của phím, ví dụ: `"KeyA"`, `"Space"` (không phụ thuộc vào ngôn ngữ)

**Mục đích trong dự án:**
Cho phép người dùng nhấn phím **ESC** để đóng Modal nhanh chóng — đây là hành vi chuẩn UX mà người dùng quen thuộc trên mọi ứng dụng web.

---

### 📌 `submit`

```javascript
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Chặn hành vi mặc định: KHÔNG tải lại trang
    // ... xử lý dữ liệu form
});
```

**Phần tử lắng nghe:** `<form id="contact-form">`

**Khi nào kích hoạt?**
Kích hoạt khi người dùng:
- Nhấn nút `type="submit"` bên trong form, **hoặc**
- Nhấn phím **Enter** khi đang focus vào một ô input trong form

**Hành vi mặc định (mà ta ngăn lại):**
Trình duyệt sẽ gửi dữ liệu form lên server và **tải lại trang**. Trong ứng dụng web hiện đại, ta luôn gọi `event.preventDefault()` để tự kiểm soát quá trình xử lý (validate, gửi AJAX, hiển thị thông báo, v.v.).

**Quy trình xử lý trong dự án:**
1. Gọi `event.preventDefault()` — chặn tải lại trang
2. Đọc giá trị từ `document.getElementById('modal-name').value`
3. Kiểm tra hợp lệ (tên và email không được trống)
4. Hiển thị thông báo thành công
5. Gọi `form.reset()` để xóa dữ liệu form
6. Gọi `closeModal()` để đóng Modal

---

### 📌 `input`

```javascript
textInput.addEventListener('input', function(event) {
    const currentValue = event.target.value; // Giá trị tức thời
    outputEl.textContent = currentValue;     // Cập nhật ngay lên DOM
});
```

**Phần tử lắng nghe:** `<input type="text" id="text-input">`

**Khi nào kích hoạt?**
Kích hoạt **mỗi khi giá trị** của ô input thay đổi, bao gồm:
- Gõ thêm ký tự
- Xóa ký tự (Backspace, Delete)
- Paste (dán) văn bản
- Cut (cắt) văn bản
- Kéo thả (Drag & Drop) văn bản vào ô

**So sánh với các sự kiện tương tự:**

| Sự kiện | Thời điểm kích hoạt | Phù hợp cho |
|---|---|---|
| `input` | **Ngay lập tức** mỗi khi giá trị thay đổi | Live preview, tìm kiếm real-time |
| `change` | Khi người dùng **rời khỏi ô** (blur) | Validate sau khi điền xong |
| `keydown` | Khi **nhấn phím xuống** (chưa có giá trị mới trong ô) | Bắt phím đặc biệt (Esc, Enter) |
| `keyup` | Khi **thả phím lên** | Tương tự `input` nhưng không bắt được paste |

**Mục đích trong dự án:** Cập nhật nội dung thẻ `<h2 id="text-heading">` theo thời gian thực khi người dùng gõ vào ô nhập liệu, tạo hiệu ứng preview trực tiếp.

---

## 3. Sơ Đồ Luồng Sự Kiện — Modal Liên Hệ

```
Người dùng
    │
    ▼
[Click "Liên Hệ Ngay"]
    │
    └──► addEventListener('click') ──► openModal()
              │                           ├── modal.classList.add('is-open')
              │                           ├── aria-hidden="false"
              │                           └── firstInput.focus()
              │
[Khi Modal đang mở — 4 cách đóng]
    │
    ├──► [Click nút ✕]       → addEventListener('click')  ──► closeModal()
    ├──► [Click "Hủy bỏ"]    → addEventListener('click')  ──► closeModal()
    ├──► [Click ngoài Modal] → addEventListener('click')  ──► closeModal() (khi event.target === overlay)
    ├──► [Nhấn phím ESC]     → addEventListener('keydown') ──► closeModal()
    │
    └──► [Nhấn "Gửi Đăng Ký"]
              │
              └──► addEventListener('submit')
                        ├── event.preventDefault() ← CHẶN TẢI LẠI TRANG
                        ├── Validate dữ liệu
                        ├── Hiển thị thông báo thành công
                        ├── form.reset()
                        └── closeModal()
```

---

## 4. Nguyên Tắc Quan Trọng

> **`event.preventDefault()`**: Ngăn hành vi mặc định của trình duyệt. Dùng với `submit` (ngăn tải lại trang), với link `<a href="#">` (ngăn cuộn lên đầu trang), với Drag & Drop (cho phép drop), v.v.

> **`event.stopPropagation()`**: Ngăn sự kiện "nổi bọt" (bubbling) lên các phần tử cha. Được dùng trong `toggleBookmark()` để tránh click vào nút bookmark lại trigger sự kiện của thẻ bọc ngoài.

> **`event.target`**: Phần tử **thực sự được click** (có thể là phần tử con). Dùng để kiểm tra người dùng có click đúng vào lớp overlay hay không trước khi đóng Modal.

> **`event.currentTarget`**: Phần tử **đang gắn event listener**. Khác `event.target` khi sự kiện bubbling lên phần tử cha.

