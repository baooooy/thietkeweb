/**
 * MangaRealm - Main JavaScript File
 * Bao gồm:
 * 1. Dữ liệu mẫu danh sách sản phẩm/truyện tranh (Data Model)
 * 2. Các hàm bổ trợ xử lý định dạng dữ liệu (Helper Functions)
 * 3. Hàm renderProductList() xử lý hiển thị tự động bằng vòng lặp
 * 4. Logic tương tác (Bookmark, Toast chào mừng theo thời gian thực)
 * 5. Khởi tạo hiệu ứng AOS (Animate On Scroll)
 */

// ==========================================================================
// 1. DỮ LIỆU MẪU SẢN PHẨM / DỊCH VỤ TRUYỆN TRANH (ARRAY OF OBJECTS)
// ==========================================================================
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
        price: 0, // 0: Miễn phí
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
        price: 0,
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
        link: "#"
    },
    {
        id: 3,
        title: "Đại Chúa Tể Đa Vũ Trụ",
        genre: "Sci-Fi, Adventure",
        chapter: "Ch. 280",
        badge: "HOT",
        badgeClass: "badge-hot",
        updatedTime: "2 giờ trước",
        views: 134000,
        price: 0,
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
        link: "#"
    },
    {
        id: 4,
        title: "Bác Sĩ Thiên Tài Ở Thế Giới Khác",
        genre: "Isekai, Y học",
        chapter: "Ch. 98",
        badge: "FULL",
        badgeClass: "badge-full",
        updatedTime: "5 giờ trước",
        views: 78600,
        price: 0,
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
        link: "#"
    },
    {
        id: 5,
        title: "Ta Có Thể Cường Hóa Mọi Thần Binh",
        genre: "Hệ Thống, Tu Tiên",
        chapter: "Ch. 215",
        badge: "HOT",
        badgeClass: "badge-hot",
        updatedTime: "8 giờ trước",
        views: 210000,
        price: 0,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
        link: "#"
    },
    {
        id: 6,
        title: "Lời Hứa Của Nữ Hoàng Băng Giá",
        genre: "Romance, Fantasy",
        chapter: "Ch. 74",
        badge: "FULL",
        badgeClass: "badge-full",
        updatedTime: "12 giờ trước",
        views: 95300,
        price: 0,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80",
        link: "#"
    }
];

// ==========================================================================
// 2. CÁC HÀM TRỢ GIÚP ĐỊNH DẠNG & CHUẨN HÓA DỮ LIỆU (HELPER FUNCTIONS)
// ==========================================================================

/**
 * Định dạng số lượt xem sang dạng rút gọn (ví dụ: 1200 -> 1.2K, 1500000 -> 1.5M)
 * @param {number|string} views - Số lượt xem gốc
 * @returns {string} Chuỗi hiển thị lượt xem đã format
 */
function formatViews(views) {
    if (typeof views === 'string') return views;
    if (typeof views !== 'number' || isNaN(views)) return '0';
    
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (views >= 1000) {
        return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return views.toString();
}

/**
 * Định dạng giá tiền / dịch vụ theo tiền tệ Việt Nam (VNĐ)
 * @param {number} price - Giá tiền
 * @returns {string} Chuỗi hiển thị giá
 */
function formatPrice(price) {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// ==========================================================================
// 3. HÀM HIỂN THỊ DANH SÁCH SẢN PHẨM TỰ ĐỘNG BẰNG VÒNG LẶP (RENDER FUNCTION)
// ==========================================================================
/**
 * Tự động tạo giao diện danh sách sản phẩm từ mảng dữ liệu truyền vào
 * Thực hiện đầy đủ các tác vụ:
 * - Kiểm tra hợp lệ DOM container và mảng dữ liệu
 * - Xử lý fallback cho các trường dữ liệu bị thiếu
 * - Dùng vòng lặp map() biến đổi dữ liệu thành các khối HTML
 * - Tối ưu gán DOM một lần (Single DOM mutation)
 * - Tự động đồng bộ hiệu ứng AOS và gán sự kiện tương tác
 * 
 * @param {Array} products - Mảng dữ liệu các sản phẩm/truyện cần hiển thị
 * @param {string} containerId - ID của phần tử HTML chứa danh sách
 */
function renderProductList(products, containerId) {
    // 1. Kiểm tra phần tử chứa có tồn tại trên DOM không
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[MangaRealm] Lỗi: Không tìm thấy phần tử HTML có id="${containerId}"`);
        return;
    }

    // 2. Xử lý trường hợp dữ liệu rỗng hoặc không phải mảng (Empty State)
    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📭</span>
                <p class="empty-state-text">Hiện chưa có sản phẩm nào trong danh mục này.</p>
                <p class="empty-state-sub">Vui lòng quay lại sau hoặc thử tìm kiếm tác phẩm khác.</p>
            </div>
        `;
        return;
    }

    // Ảnh mặc định dự phòng khi sản phẩm thiếu ảnh bìa
    const defaultImage = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80";

    // 3. Vòng lặp map() duyệt qua từng sản phẩm để sinh HTML động
    const htmlContent = products.map((item, index) => {
        // Tác vụ 3.1: Xử lý giá trị mặc định / fallback dữ liệu
        const title = item.title || "Tác phẩm chưa đặt tên";
        const image = item.image || defaultImage;
        const link = item.link || "#";
        const genre = item.genre || "Truyện tranh";
        const chapter = item.chapter || "Đang cập nhật";
        const updatedTime = item.updatedTime || "Mới đây";
        const viewsDisplay = formatViews(item.views);

        // Tác vụ 3.2: Xử lý nhãn trạng thái (Badge) chỉ hiển thị khi có dữ liệu
        const badgeHtml = item.badge 
            ? `<span class="badge ${item.badgeClass || 'badge-hot'}">${item.badge}</span>` 
            : '';

        // Tác vụ 3.3: Tính độ trễ animation xuất hiện so le (Staggered animation delay)
        const animationDelay = ((index % 6) + 1) * 80;

        // Tác vụ 3.4: Trả về khối HTML của từng sản phẩm thông qua Template String
        return `
            <article class="story-card comic-card" data-id="${item.id || index}" data-aos="fade-up" data-aos-delay="${animationDelay}">
                <div class="card-thumb">
                    <img src="${image}" alt="Bìa truyện ${title}" loading="lazy">
                    ${badgeHtml}
                    <span class="chapter-tag">${chapter}</span>
                    <button type="button" class="bookmark-btn" aria-label="Lưu vào tủ truyện" title="Lưu vào tủ truyện" onclick="toggleBookmark(event, ${item.id || index})">
                        🔖
                    </button>
                </div>
                <div class="card-body">
                    <h3 class="card-title">
                        <a href="${link}">${title}</a>
                    </h3>
                    <p class="card-genre">${genre}</p>
                    <div class="card-footer">
                        <span class="updated-time">🕒 ${updatedTime}</span>
                        <span class="view-count">👁️ ${viewsDisplay}</span>
                    </div>
                </div>
            </article>
        `;
    }).join(''); // Ghép mảng các chuỗi HTML thành một khối chuỗi HTML duy nhất

    // 4. Chèn toàn bộ HTML vào vùng chứa trên giao diện (Single DOM operation)
    container.innerHTML = htmlContent;

    // 5. Làm mới lại AOS để nhận diện các thẻ HTML vừa sinh ra tự động
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// ==========================================================================
// 4. CÁC TÁC VỤ TƯƠNG TÁC NGƯỜI DÙNG (EVENT HANDLERS)
// ==========================================================================
/**
 * Xử lý đánh dấu yêu thích / bookmark sản phẩm
 * @param {Event} event - Sự kiện click
 * @param {number|string} id - ID sản phẩm
 */
function toggleBookmark(event, id) {
    event.stopPropagation();
    const btn = event.currentTarget;
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        btn.textContent = '❤️';
        btn.setAttribute('title', 'Đã lưu vào tủ truyện');
    } else {
        btn.textContent = '🔖';
        btn.setAttribute('title', 'Lưu vào tủ truyện');
    }
}

// ==========================================================================
// 5. KHỞI TẠO ỨNG DỤNG KHI TẢI XONG TRANG (DOMContentLoaded)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Gọi hàm renderProductList để hiển thị dữ liệu mẫu ra khối #comicGrid
    renderProductList(comicList, 'comicGrid');

    // 2. Khởi tạo hiệu ứng cuộn trang AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 800,
            easing: 'ease-out-cubic',
            offset: 60
        });
    }

    // 3. Kích hoạt thông báo chào mừng theo thời gian thực
    initRealtimeGreeting();

    // 4. Gán sự kiện cho nút đóng thông báo Toast
    const closeBtn = document.getElementById('toastCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeToast);
    }

    // 5. Khởi tạo tính năng Bật/Tắt đèn và Đổi màu nền body (Dark Mode đơn giản)
    initBulbToggle();

    // 6. Khởi tạo tính năng Lắng nghe sự kiện 'input' (Live Text Preview)
    initLiveInput();

    // 7. Khởi tạo Modal Liên Hệ
    initContactModal();
});

// ==========================================================================
// 6. LOGIC THÔNG BÁO CHÀO MỪNG THEO THỜI GIAN THỰC
// ==========================================================================
function initRealtimeGreeting() {
    const now = new Date();
    const hour = now.getHours();

    let icon = '✨';
    let title = '';
    let message = '';

    if (hour >= 5 && hour < 11) {
        icon = '🌅';
        title = 'Chào buổi sáng!';
        message = 'Chúc bạn một ngày mới tràn đầy năng lượng và tích cực!';
    } else if (hour >= 11 && hour < 14) {
        icon = '☀️';
        title = 'Chào buổi trưa!';
        message = 'Chúc bạn có thời gian nghỉ trưa thoải mái và bữa trưa ngon miệng!';
    } else if (hour >= 14 && hour < 18) {
        icon = '🌤️';
        title = 'Chào buổi chiều!';
        message = 'Chúc bạn một buổi chiều làm việc và đọc truyện thật vui vẻ!';
    } else if (hour >= 18 && hour < 22) {
        icon = '🌙';
        title = 'Chào buổi tối!';
        message = 'Chúc bạn có những phút giây thư giãn tuyệt vời sau một ngày dài!';
    } else {
        icon = '🌌';
        title = 'Khuya rồi, cú đêm ơi!';
        message = 'Đọc truyện xong nhớ nghỉ ngơi sớm để giữ gìn sức khỏe bạn nhé!';
    }

    const iconEl = document.getElementById('greeting-icon');
    const titleEl = document.getElementById('greeting-title');
    const descEl = document.getElementById('greeting-desc');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = message;

    setTimeout(() => {
        const toast = document.getElementById('welcome-toast');
        if (toast) {
            toast.classList.add('show');
        }
    }, 1800);

    setTimeout(() => {
        closeToast();
    }, 7500);
}

function closeToast() {
    const toast = document.getElementById('welcome-toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// ==========================================================================
// 7. BÀI TẬP: TÍNH NĂNG DARK MODE ĐƠN GIẢN (MẶT TRỜI / MẶT TRĂNG)
// ==========================================================================
/**
 * Khi click vào một nút có id là 'toggle-btn':
 * - Thay đổi màu nền của body từ trắng sang đen và ngược lại.
 * - Thay đổi biểu tượng giữa Mặt trời ☀️ và Mặt trăng 🌙.
 * - Đổi chữ nút giữa "Bật đèn" và "Tắt đèn" (đã bỏ chữ nền trắng/đen trong ngoặc).
 */
function initBulbToggle() {
    // 1. Lấy các phần tử DOM qua ID
    const toggleBtn = document.getElementById('toggle-btn');
    const themeIcon = document.getElementById('theme-icon') || document.getElementById('bulb-img');

    // Kiểm tra an toàn: nếu không có nút trên trang thì dừng
    if (!toggleBtn) return;

    // 2. Thiết lập trạng thái ban đầu:
    // Nền trắng, chữ đen, biểu tượng Mặt trời ☀️
    document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';
    document.body.classList.add('light-mode');

    if (themeIcon) {
        themeIcon.textContent = '☀️';
        themeIcon.setAttribute('aria-label', 'Mặt trời');
        // Tiện ích: Cho phép click trực tiếp vào biểu tượng để bật/tắt
        themeIcon.addEventListener('click', () => toggleBtn.click());
    }

    toggleBtn.textContent = 'Bật đèn';

    // 3. Đăng ký sự kiện click cho nút có id là 'toggle-btn'
    toggleBtn.addEventListener('click', function() {
        // Kiểm tra màu nền body hiện tại: Nếu đang là trắng thì chuyển sang đen, ngược lại sang trắng
        if (document.body.style.backgroundColor === 'white') {
            // === CHUYỂN SANG NỀN ĐEN & HIỆN MẶT TRĂNG 🌙 ===
            document.body.style.backgroundColor = 'black';
            document.body.style.color = 'white';
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');

            if (themeIcon) {
                themeIcon.textContent = '🌙';
                themeIcon.setAttribute('aria-label', 'Mặt trăng');
            }

            toggleBtn.textContent = 'Tắt đèn';
        } else {
            // === CHUYỂN SANG NỀN TRẮNG & HIỆN MẶT TRỜI ☀️ ===
            document.body.style.backgroundColor = 'white';
            document.body.style.color = 'black';
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');

            if (themeIcon) {
                themeIcon.textContent = '☀️';
                themeIcon.setAttribute('aria-label', 'Mặt trời');
            }

            toggleBtn.textContent = 'Bật đèn';
        }
    });
}

// ==========================================================================
// 8. BÀI TẬP: SỰ KIỆN 'INPUT' - LIVE TEXT PREVIEW
// ==========================================================================
/**
 * Lắng nghe sự kiện 'input' từ ô text:
 * - Khi người dùng gõ chữ vào ô text:
 *   + Lấy giá trị tức thời bằng `event.target.value` (hoặc `this.value`).
 *   + Hiển thị ngay lập tức vào thẻ <h2> bên dưới (theo đề bài).
 *   + Hiển thị ngay lập tức vào thẻ <span> bên cạnh (theo hướng dẫn).
 */
function initLiveInput() {
    // 1. Lấy phần tử ô nhập liệu, thẻ h2 bên dưới và thẻ span bên cạnh
    const textInput = document.getElementById('text-input');
    const textHeading = document.getElementById('text-heading');
    const textSpan = document.getElementById('text-span');

    if (!textInput) return;

    // 2. Lắng nghe sự kiện 'input' (kích hoạt tức thì mỗi khi gõ/xóa bất kỳ ký tự nào)
    textInput.addEventListener('input', function(event) {
        // Lấy giá trị hiện tại trong ô input
        const currentValue = event.target.value;

        // Cập nhật tức thời vào thẻ <h2> bên dưới
        if (textHeading) {
            textHeading.textContent = currentValue.trim() !== '' 
                ? currentValue 
                : '(Nội dung hiển thị ở đây)';
        }

        // Cập nhật tức thời vào thẻ <span> bên cạnh
        if (textSpan) {
            textSpan.textContent = currentValue.trim() !== '' 
                ? currentValue 
                : '(Chưa có chữ)';
        }
    });
}

// ==========================================================================
// 9. BÀI TẬP: MODAL LIÊN HỆ - ĐÓNG/MỞ BẰNG JAVASCRIPT
// ==========================================================================
/**
 * Yêu cầu:
 * - Khi nhấn nút "Liên Hệ Ngay" (#open-contact-modal): mở Modal.
 * - Khi nhấn nút ✕ (#close-modal-btn) hoặc "Hủy bỏ" (#cancel-modal-btn): đóng Modal.
 * - Khi click ra ngoài vùng Modal (.modal-overlay): đóng Modal.
 * - Khi nhấn phím Escape: đóng Modal.
 * - Khi submit form: hiển thị thông báo thành công và đóng Modal (không tải lại trang).
 */
function initContactModal() {
    // 1. Lấy các phần tử DOM liên quan đến Modal
    const openBtn    = document.getElementById('open-contact-modal');
    const modal      = document.getElementById('contact-modal');
    const closeBtn   = document.getElementById('close-modal-btn');
    const cancelBtn  = document.getElementById('cancel-modal-btn');
    const form       = document.getElementById('contact-form');

    // Kiểm tra an toàn: bỏ qua nếu không có modal trên trang
    if (!openBtn || !modal) return;

    // --- Hàm tiện ích: Mở Modal ---
    function openModal() {
        modal.classList.add('is-open');          // Thêm class để CSS hiện Modal
        modal.setAttribute('aria-hidden', 'false');
        // Tự động đặt focus vào ô tên đầu tiên khi mở (Accessibility)
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
        // Chặn scroll trang nền
        document.body.style.overflow = 'hidden';
    }

    // --- Hàm tiện ích: Đóng Modal ---
    function closeModal() {
        modal.classList.remove('is-open');       // Bỏ class để CSS ẩn Modal
        modal.setAttribute('aria-hidden', 'true');
        // Khôi phục scroll trang nền
        document.body.style.overflow = '';
    }

    // --- SỰ KIỆN 1: 'click' trên nút "Liên Hệ Ngay" → MỞ Modal ---
    openBtn.addEventListener('click', openModal);

    // --- SỰ KIỆN 2: 'click' trên nút ✕ → ĐÓNG Modal ---
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // --- SỰ KIỆN 3: 'click' trên nút "Hủy bỏ" → ĐÓNG Modal ---
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // --- SỰ KIỆN 4: 'click' ra ngoài vùng nội dung Modal → ĐÓNG Modal ---
    // Chỉ đóng khi click đúng vào lớp overlay (nền tối), không phải .modal-box
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- SỰ KIỆN 5: 'keydown' trên toàn bộ document → Nhấn phím ESC để ĐÓNG ---
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // --- SỰ KIỆN 6: 'submit' trên form → Xử lý gửi form mà KHÔNG TẢI LẠI TRANG ---
    if (form) {
        form.addEventListener('submit', function(event) {
            // event.preventDefault() ngăn hành vi mặc định của form (không tải lại trang)
            event.preventDefault();

            // Lấy dữ liệu form
            const name  = document.getElementById('modal-name').value.trim();
            const email = document.getElementById('modal-email').value.trim();

            // Kiểm tra trường bắt buộc
            if (!name || !email) {
                alert('⚠️ Vui lòng điền đầy đủ họ tên và email!');
                return;
            }

            // Hiển thị thông báo thành công (có thể thay bằng Toast đẹp hơn)
            alert(`✅ Cảm ơn ${name}! Chúng tôi sẽ liên hệ qua email ${email} sớm nhất có thể.`);

            // Reset form và đóng Modal sau khi gửi thành công
            form.reset();
            closeModal();
        });
    }
}
