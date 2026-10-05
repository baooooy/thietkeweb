# 100% PURE CSS - BẢN HƯỚNG DẪN 6 BÀI TẬP CSS ANIMATIONS
*(Hoàn toàn không sử dụng bất kỳ 1 dòng mã JavaScript nào)*

---

### 📌 Bài 1: Floating Action Button (FAB) + Pulse Animation
- **Mục tiêu**: Nút tròn cố định góc màn hình, tạo hào quang phập phồng (pulse) liên tục.
- **HTML**:
```html
<div class="fab-container">
    <div class="fab-pulse-wave"></div>
    <div class="fab-pulse-wave delay"></div>
    <a href="#contact" class="fab-button">
        <i class="fa-solid fa-comment-dots"></i>
    </a>
</div>
```
- **CSS**:
```css
.fab-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
}
.fab-button {
    position: relative;
    z-index: 2;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(56, 189, 248, 0.4);
    animation: fab-heartbeat 2s infinite ease-in-out;
}
.fab-pulse-wave {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px;
    border-radius: 50%;
    background: #38bdf8;
    animation: fab-pulse 2.2s infinite cubic-bezier(0.24, 0, 0.38, 1);
}
.fab-pulse-wave.delay { animation-delay: 1.1s; }

@keyframes fab-pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.75; }
    70% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.15; }
    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
@keyframes fab-heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
}
```

---

### 📌 Bài 2: 3D Card Flip Effect (Lật 180° khi hover)
- **Mục tiêu**: Thẻ nhân sự tự động lật 180 độ 3D khi rê chuột (hover) để xem thông tin mặt sau.
- **HTML**:
```html
<div class="flip-card">
    <div class="flip-card-inner">
        <!-- Mặt trước -->
        <div class="flip-card-front">
            <h3>Khưu Đông Nhựt Long</h3>
            <p>AI Robotics & Web Dev</p>
        </div>
        <!-- Mặt sau -->
        <div class="flip-card-back">
            <h3>Thông Tin Liên Hệ</h3>
            <p>khuudongnhutlong.id.vn</p>
        </div>
    </div>
</div>
```
- **CSS**:
```css
.flip-card {
    width: 320px;
    height: 400px;
    perspective: 1000px; /* Không gian chiều sâu 3D */
}
.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
}
.flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden; /* Ẩn mặt bị xoay ra sau */
    border-radius: 16px;
}
.flip-card-back {
    transform: rotateY(180deg); /* Mặt sau quay sẵn 180 độ */
}
```

---

### 📌 Bài 3: Pure CSS Typing Effect (Không dùng JS)
- **Mục tiêu**: Tự động gõ dòng chữ "Tôi là một Web Developer..." kèm con trỏ nhấp nháy bằng CSS `@keyframes`.
- **HTML**:
```html
<span class="typing-text">Tôi là một Web Developer...</span>
```
- **CSS**:
```css
.typing-text {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    border-right: 3px solid #38bdf8;
    width: 0;
    animation: 
        typing 3.2s steps(26, end) forwards,
        blink-caret 0.75s step-end infinite;
}

@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}

@keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: #38bdf8; }
}
```

---

### 📌 Bài 4: Parallax Image Banner (background-attachment: fixed)
- **Mục tiêu**: Ảnh nền cố định, di chuyển chậm hơn nội dung khi cuộn trang.
- **HTML**:
```html
<section class="parallax-section">
    <h2>Kiến Tạo Tương Lai Với AI & Robotics</h2>
</section>
```
- **CSS**:
```css
.parallax-section {
    background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920');
    background-attachment: fixed; /* Cốt lõi của hiệu ứng Parallax thuần CSS */
    background-position: center;
    background-size: cover;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

### 📌 Bài 5: Modern Hamburger Menu (Pure CSS Checkbox Hack - Không JS)
- **Mục tiêu**: Dùng `<input type="checkbox">` và `<label>` để biến đổi 3 gạch thành dấu "X" và mở menu mượt mà.
- **HTML**:
```html
<!-- Checkbox ẩn -->
<input type="checkbox" id="menuToggle" class="menu-checkbox">

<!-- Nút bấm Hamburger (Label) -->
<label for="menuToggle" class="hamburger-btn">
    <span class="bar bar-1"></span>
    <span class="bar bar-2"></span>
    <span class="bar bar-3"></span>
</label>

<!-- Danh sách Menu -->
<nav class="nav-menu">
    <!-- Các thẻ <a> ... -->
</nav>
```
- **CSS**:
```css
.menu-checkbox {
    display: none;
}
.hamburger-btn {
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    cursor: pointer;
}
.hamburger-btn .bar {
    width: 100%;
    height: 3px;
    background: #fff;
    border-radius: 4px;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Biến đổi thành dấu "X" khi checkbox được check */
.menu-checkbox:checked + .hamburger-btn .bar-1 {
    transform: translateY(8px) rotate(45deg);
    background-color: #38bdf8;
}
.menu-checkbox:checked + .hamburger-btn .bar-2 {
    opacity: 0;
    transform: scaleX(0);
}
.menu-checkbox:checked + .hamburger-btn .bar-3 {
    transform: translateY(-8px) rotate(-45deg);
    background-color: #38bdf8;
}

/* Mở menu khi checkbox được check */
.menu-checkbox:checked ~ .nav-menu {
    clip-path: circle(150% at top right);
    pointer-events: auto;
}
```

---

### 📌 Bài 6: Skill Bar Animation (Chạy tự động từ 0% đến đích khi load)
- **Mục tiêu**: Tự động chạy thanh tỷ lệ kỹ năng khi tải trang mà không cần JS.
- **HTML**:
```html
<div class="skill-bar-bg">
    <div class="skill-bar-fill" style="--target-width: 90%;"></div>
</div>
```
- **CSS**:
```css
.skill-bar-bg {
    width: 100%;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    overflow: hidden;
}
.skill-bar-fill {
    height: 100%;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    width: 0;
    animation: fillSkillBar 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fillSkillBar {
    from { width: 0%; }
    to { width: var(--target-width); }
}
```
