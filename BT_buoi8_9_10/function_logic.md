# GIẢI THÍCH LOGIC TRUYỀN DỮ LIỆU VÀ CƠ CHẾ HIỂN THỊ TỰ ĐỘNG BẰNG JAVASCRIPT

Tài liệu này giải thích chi tiết cách truyền dữ liệu mẫu vào hàm JavaScript, quy trình xử lý bên trong hàm bằng vòng lặp và cơ chế tự động sinh giao diện (Data-Driven UI Rendering) thay vì phải viết mã HTML tĩnh lặp đi lặp lại.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

Thay vì phải tự tay sao chép (copy-paste) hàng chục khối thẻ HTML `<article class="story-card">...` cho từng sản phẩm truyện tranh, mô hình hiện đại sử dụng **tách biệt Dữ liệu (Data) và Giao diện (Presentation)**:

```
[ Dữ liệu mẫu: Mảng comicList ]
              │
              ▼
[ Hàm xử lý: renderProductList(products, containerId) ]
  ├─ Kiểm tra dữ liệu & DOM hợp lệ (Validation)
  ├─ Xử lý giá trị mặc định / fallback (Sanitization)
  ├─ Dùng vòng lặp map() duyệt từng item & nội suy chuỗi HTML (Template String)
  └─ Gộp chuỗi (.join('')) và chèn vào DOM (Single DOM Mutation)
              │
              ▼
[ Giao diện hiển thị: #comicGrid ]
```

---

## 2. Cấu Trúc Dữ Liệu Truyền Vào (Data Model)

Dữ liệu được tổ chức dưới dạng một **Mảng các đối tượng (Array of Objects)**. Mỗi đối tượng đại diện cho một sản phẩm truyện tranh/dịch vụ với các thuộc tính rõ ràng:

```javascript
const comicList = [
    {
        id: 1,
        title: "Kiếm Sĩ Bóng Đêm Tái Sinh",
        genre: "Action, Huyền Huyễn",
        chapter: "Ch. 142",
        badge: "HOT",
        badgeClass: "badge-hot",
        updatedTime: "15 phút trước",
        views: 89400,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
        link: "#"
    },
    {
        id: 2,
        title: "Thiên Tài Phế Vật Của Học Viện Pháp Thuật",
        genre: "Magic, School Life",
        chapter: "Ch. 36",
        badge: "FULL",
        badgeClass: "badge-full",
        updatedTime: "45 phút trước",
        views: 52100,
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
        link: "#"
    }
    // ... các sản phẩm khác
];
```

### Ý nghĩa các trường dữ liệu:
- `id`: Mã định danh duy nhất của tác phẩm (hỗ trợ lưu bookmark, xem chi tiết).
- `title`: Tên tác phẩm/sản phẩm.
- `genre`: Thể loại phân loại.
- `chapter`: Số chương hoặc tiến độ mới nhất.
- `badge` & `badgeClass`: Nhãn trạng thái nổi bật (`HOT`, `FULL`, `NEW`) và class CSS tương ứng.
- `updatedTime`: Thời gian cập nhật gần nhất.
- `views`: Số lượt xem (dạng số nguyên hoặc chuỗi đã format).
- `image`: Đường dẫn URL ảnh bìa minh họa.
- `link`: Đường dẫn liên kết đến trang đọc/chi tiết.

---

## 3. Cách Truyền Dữ Liệu Vào Hàm `renderProductList`

Hàm được thiết kế dạng **hàm thuần túy có khả năng tái sử dụng cao (Reusable Component Function)** nhận vào 2 tham số:

```javascript
function renderProductList(products, containerId) { ... }
```

### Tham số đầu vào:
1. `products` *(Array)*: Mảng dữ liệu chứa danh sách các đối tượng cần hiển thị (ví dụ `comicList`).
2. `containerId` *(String)*: Chuỗi ID của phần tử HTML cha sẽ chứa các card sản phẩm trên DOM (ví dụ `'comicGrid'`).

### Thời điểm và cách gọi hàm:
Trong sự kiện trang web đã nạp xong cây DOM (`DOMContentLoaded`), hàm được gọi như sau:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Truyền mảng dữ liệu comicList vào thẻ chứa có id="comicGrid"
    renderProductList(comicList, 'comicGrid');
});
```

> **Khả năng mở rộng:** Nếu sau này website có thêm tính năng lọc theo thể loại (Filter) hoặc phân trang (Pagination), bạn chỉ cần truyền mảng dữ liệu đã lọc vào hàm:
> ```javascript
> // Ví dụ: Lọc truyện HOT và render lại
> const hotComics = comicList.filter(comic => comic.badge === 'HOT');
> renderProductList(hotComics, 'comicGrid');
> ```

---

## 4. Các Tác Vụ Chi Tiết Được Xử Lý Bên Trong Hàm

Hàm `renderProductList()` trong `script.js` đã được bổ sung đầy đủ các tác vụ chuyên nghiệp sau:

### Tác vụ 1: Kiểm tra tính hợp lệ của tham số & DOM Container
- Kiểm tra `document.getElementById(containerId)` có tồn tại hay không. Nếu không, in thông báo lỗi vào `console.error` và dừng hàm, tránh gây lỗi JavaScript làm ngừng toàn bộ trang.

### Tác vụ 2: Xử lý trạng thái rỗng (Empty State)
- Nếu `products` không phải là mảng hoặc có độ dài bằng 0 (`products.length === 0`), hàm tự động hiển thị khối thông báo rỗng đẹp mắt có icon và mô tả thân thiện, thay vì để trang trắng hoặc lỗi giao diện:
```javascript
if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = `
        <div class="empty-state">
            <span class="empty-state-icon">📭</span>
            <p class="empty-state-text">Hiện chưa có sản phẩm nào trong danh mục này.</p>
        </div>
    `;
    return;
}
```

### Tác vụ 3: Chuẩn hóa dữ liệu & Giá trị dự phòng (Data Sanitization & Fallback)
Khi làm việc với dữ liệu thực tế, một số sản phẩm có thể bị thiếu ảnh, thiếu lượt xem hoặc tiêu đề. Hàm đã bổ sung cơ chế gán giá trị mặc định:
- `image`: Sử dụng ảnh mặc định nếu sản phẩm thiếu ảnh.
- `title`: Gán `"Tác phẩm chưa đặt tên"` nếu thiếu.
- `views`: Được tự động format thông qua hàm trợ giúp `formatViews()` (chuyển đổi `89400` thành `'89.4K'`, `1200000` thành `'1.2M'`).
- `badge`: Chỉ tạo thẻ `<span class="badge ...">` khi thuộc tính `badge` có giá trị, ngăn chặn việc sinh ra các thẻ badge rỗng.

### Tác vụ 4: Vòng lặp `map()` và Template Literals tạo HTML tự động
- Sử dụng phương thức mảng hiện đại `.map((item, index) => { ... })` để duyệt qua từng đối tượng trong danh sách.
- Sử dụng **Template Literals** (dấu backtick `` `...` `` và cú pháp nội suy `${item.property}`) để truyền dữ liệu trực tiếp vào khung HTML:
```javascript
const htmlContent = products.map((item, index) => {
    const animationDelay = ((index % 6) + 1) * 80;
    return `
        <article class="story-card comic-card" data-aos="fade-up" data-aos-delay="${animationDelay}">
            <div class="card-thumb">
                <img src="${image}" alt="Bìa truyện ${title}" loading="lazy">
                ${badgeHtml}
                <span class="chapter-tag">${chapter}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title"><a href="${link}">${title}</a></h3>
                <p class="card-genre">${genre}</p>
                <div class="card-footer">
                    <span class="updated-time">🕒 ${updatedTime}</span>
                    <span class="view-count">👁️ ${viewsDisplay}</span>
                </div>
            </div>
        </article>
    `;
}).join('');
```

### Tác vụ 5: Tối ưu hiệu năng render (Single DOM Mutation)
- Không gọi `container.innerHTML += ...` bên trong mỗi vòng lặp vì việc này sẽ khiến trình duyệt phải parse lại DOM nhiều lần (gây hiện tượng reflow/repaint giảm hiệu năng).
- Thay vào đó, dùng `.join('')` ghép toàn bộ mảng thành một chuỗi duy nhất, sau đó chỉ gán `container.innerHTML = htmlContent;` **đúng 1 lần**.

### Tác vụ 6: Hậu xử lý (Post-Render Actions)
- **Tự động làm mới hiệu ứng cuộn:** Gọi `AOS.refresh()` để thư viện Animate On Scroll nhận diện ngay các phần tử vừa mới sinh ra từ JavaScript.
- **Tương tác trực tiếp:** Tích hợp nút Bookmark (🔖 / ❤️) trên từng thẻ truyện kèm hàm xử lý sự kiện `toggleBookmark()`.

---

## 5. Ưu Điểm Của Cách Làm Này So Với HTML Tĩnh

| Tiêu chí | Viết HTML thủ công | Dùng Vòng lặp JavaScript (Mô hình hiện tại) |
| :--- | :--- | :--- |
| **Bảo trì (Maintenance)** | Khi muốn đổi mẫu card, phải sửa từng thẻ HTML trong file `.html`. | Chỉ cần sửa 1 lần trong chuỗi template của hàm JavaScript. |
| **Khả năng mở rộng** | Rất cực khi có hàng trăm sản phẩm. | Dễ dàng tải thêm (Infinite scroll) hoặc phân trang với 1 dòng code. |
| **Kết nối API backend** | Không thể làm việc trực tiếp với REST API / GraphQL. | Dữ liệu JSON từ API được truyền trực tiếp vào hàm để render ngay lập tức. |
| **Dung lượng code** | File HTML cồng kềnh, lặp mã nghiêm trọng. | File HTML gọn gàng, chỉ chứa container `<div id="comicGrid"></div>`. |
