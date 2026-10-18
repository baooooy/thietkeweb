const STORAGE_KEY = "vay-vui-games-v1";
const DRAFT_KEY = "vay-vui-current-game-v1";
const PROFILE_KEY = "vay-vui-profile-v1";
const THEME_KEY = "vay-vui-theme-v1";
const SIZE = 19;
const STAR_POINTS = new Set([3, 9, 15]);
const boardElement = document.querySelector("#go-board");
const statusElement = document.querySelector("#board-status");
const gameTitle = document.querySelector("#game-title");
const toastElement = document.querySelector("#toast");
const loginDialog = document.querySelector("#login-dialog");
const supportDialog = document.querySelector("#support-dialog");

let moves = [];
let gameStates = [];
let reviewIndex = null;
let savedGames = [];
let toastTimer;
let playTimer;

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastElement.classList.remove("show"), 3200);
}

function applyTheme(theme, persist = false) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    const button = document.querySelector("#theme-toggle");
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối");
    button.title = isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối";
    button.querySelector("span").textContent = isDark ? "☀" : "☾";
    document.querySelector('meta[name="theme-color"]').content = isDark ? "#17151e" : "#fffaf4";
    if (persist) {
        try {
            localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
        } catch (error) {
            showToast(`Không thể lưu giao diện: ${error.message}`);
        }
    }
}

function activateLessonTab(tab, moveFocus = false) {
    const tabs = [...document.querySelectorAll(".lesson-tab")];
    const panels = [...document.querySelectorAll(".lesson-panel")];
    tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
        const active = panel.id === tab.getAttribute("aria-controls");
        panel.hidden = !active;
        panel.classList.toggle("active", active);
    });
    const indicator = document.querySelector(".tab-indicator");
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    if (moveFocus) tab.focus();
}

function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        applyTheme(savedTheme === "dark" ? "dark" : "light");
    } catch (error) {
        applyTheme("light");
        showToast(`Không đọc được tùy chọn giao diện: ${error.message}`);
    }
}

function readGames() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(stored)) throw new Error("Dữ liệu kỳ phổ không đúng định dạng.");
        return stored.filter(game =>
            game && typeof game.id === "string" && typeof game.title === "string" &&
            Array.isArray(game.moves) && game.moves.every(isValidStoredMove)
        );
    } catch (error) {
        showToast(`Không đọc được kỳ phổ trên thiết bị: ${error.message}`);
        return [];
    }
}

function readProfile() {
    try {
        const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
        return profile && typeof profile.name === "string" ? profile : null;
    } catch (error) {
        showToast(`Không đọc được hồ sơ trên thiết bị: ${error.message}`);
        return null;
    }
}

function persistGames() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
        renderSavedGames();
    } catch (error) {
        showToast(`Không thể lưu trên thiết bị này: ${error.message}`);
    }
}

function readDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (!draft) return null;
        if (typeof draft.title !== "string" || !Array.isArray(draft.moves) || !draft.moves.every(isValidStoredMove))
            throw new Error("Ván đang chơi không đúng định dạng.");
        return draft;
    } catch (error) {
        showToast(`Không đọc được ván đang chơi: ${error.message}`);
        return null;
    }
}

function persistDraft() {
    try {
        if (moves.length === 0) {
            localStorage.removeItem(DRAFT_KEY);
            return;
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            title: gameTitle.value.trim(),
            moves,
            updatedAt: new Date().toISOString()
        }));
    } catch (error) {
        showToast(`Không thể tự lưu ván cờ: ${error.message}`);
    }
}

function isValidStoredMove(move) {
    if (!move || (move.color !== "B" && move.color !== "W")) return false;
    return move.pass === true ||
        (Number.isInteger(move.x) && move.x >= 0 && move.x < SIZE &&
        Number.isInteger(move.y) && move.y >= 0 && move.y < SIZE);
}

function createState() {
    const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    return {
        board,
        prisoners: { B: 0, W: 0 },
        turn: "B",
        consecutivePasses: 0,
        lastWasPass: false,
        gameOver: false,
        hashes: [boardHash(board)]
    };
}

function boardHash(board) {
    return board.map(row => row.join("")).join("");
}

function adjacentPoints(x, y) {
    const points = [];
    if (x > 0) points.push([x - 1, y]);
    if (x < SIZE - 1) points.push([x + 1, y]);
    if (y > 0) points.push([x, y - 1]);
    if (y < SIZE - 1) points.push([x, y + 1]);
    return points;
}

function findGroup(board, startX, startY) {
    const color = board[startY][startX];
    const queue = [[startX, startY]];
    const visited = new Set([`${startX},${startY}`]);
    const liberties = new Set();
    for (let index = 0; index < queue.length; index += 1) {
        const [x, y] = queue[index];
        for (const [nextX, nextY] of adjacentPoints(x, y)) {
            const key = `${nextX},${nextY}`;
            if (board[nextY][nextX] === 0) liberties.add(key);
            else if (board[nextY][nextX] === color && !visited.has(key)) {
                visited.add(key);
                queue.push([nextX, nextY]);
            }
        }
    }
    return { stones: queue, liberties };
}

function applyMove(previous, move) {
    if (previous.gameOver) throw new Error("Ván cờ đã kết thúc. Hãy bắt đầu ván mới.");
    if (move.color !== previous.turn) throw new Error("Không đúng lượt của quân này.");
    const next = {
        board: previous.board.map(row => row.slice()),
        prisoners: { ...previous.prisoners },
        turn: previous.turn === "B" ? "W" : "B",
        consecutivePasses: 0,
        lastWasPass: false,
        gameOver: false,
        hashes: previous.hashes.slice()
    };
    if (move.pass) {
        next.consecutivePasses = previous.consecutivePasses + 1;
        next.lastWasPass = true;
        next.gameOver = next.consecutivePasses >= 2;
        next.hashes.push(boardHash(next.board));
        return { state: next, captured: [] };
    }
    if (!Number.isInteger(move.x) || !Number.isInteger(move.y) ||
        move.x < 0 || move.x >= SIZE || move.y < 0 || move.y >= SIZE)
        throw new Error("Giao điểm nằm ngoài bàn cờ.");
    if (next.board[move.y][move.x] !== 0) throw new Error("Giao điểm này đã có quân rồi!");

    const colorValue = move.color === "B" ? 1 : 2;
    const opponentValue = move.color === "B" ? 2 : 1;
    next.board[move.y][move.x] = colorValue;
    const checkedGroups = new Set();
    const captured = [];
    for (const [x, y] of adjacentPoints(move.x, move.y)) {
        if (next.board[y][x] !== opponentValue) continue;
        const group = findGroup(next.board, x, y);
        const groupKey = group.stones.map(([stoneX, stoneY]) => `${stoneX},${stoneY}`).sort().join("|");
        if (checkedGroups.has(groupKey)) continue;
        checkedGroups.add(groupKey);
        if (group.liberties.size === 0) {
            for (const [stoneX, stoneY] of group.stones) {
                next.board[stoneY][stoneX] = 0;
                captured.push({ x: stoneX, y: stoneY });
            }
        }
    }

    const ownGroup = findGroup(next.board, move.x, move.y);
    if (ownGroup.liberties.size === 0) throw new Error("Nước tự sát không hợp lệ: nhóm quân của bạn sẽ không còn khí.");
    const hash = boardHash(next.board);
    if (!previous.lastWasPass && previous.hashes.length > 1 && hash === previous.hashes[previous.hashes.length - 2])
        throw new Error("Luật ko: không được lập tức đưa bàn cờ về vị trí trước đó.");
    next.prisoners[move.color] += captured.length;
    next.hashes.push(hash);
    return { state: next, captured };
}

function rebuildGameStates(sourceMoves, strict = false) {
    const states = [createState()];
    const normalizedMoves = [];
    let state = states[0];
    for (const move of sourceMoves) {
        try {
            const result = applyMove(state, move);
            normalizedMoves.push({ ...move, captured: result.captured });
            state = result.state;
            states.push(state);
        } catch (error) {
            if (strict) throw new Error(`Kỳ phổ không hợp lệ tại nước ${normalizedMoves.length + 1}: ${error.message}`);
            showToast(`Kỳ phổ cũ có nước không hợp lệ tại nước ${normalizedMoves.length + 1}: ${error.message}`);
            break;
        }
    }
    return { states, moves: normalizedMoves };
}

function calculateScore(state) {
    const visited = new Set();
    const territory = { B: 0, W: 0 };
    for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
            const startKey = `${x},${y}`;
            if (state.board[y][x] !== 0 || visited.has(startKey)) continue;
            const queue = [[x, y]];
            const borders = new Set();
            let touchesBoardEdge = false;
            visited.add(startKey);
            for (let index = 0; index < queue.length; index += 1) {
                const [currentX, currentY] = queue[index];
                if (currentX === 0 || currentX === SIZE - 1 || currentY === 0 || currentY === SIZE - 1)
                    touchesBoardEdge = true;
                for (const [nextX, nextY] of adjacentPoints(currentX, currentY)) {
                    const value = state.board[nextY][nextX];
                    if (value === 0) {
                        const key = `${nextX},${nextY}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            queue.push([nextX, nextY]);
                        }
                    } else borders.add(value === 1 ? "B" : "W");
                }
            }
            if (!touchesBoardEdge && borders.size === 1) territory[[...borders][0]] += queue.length;
        }
    }
    return {
        territory,
        total: {
            B: territory.B + state.prisoners.B,
            W: territory.W + state.prisoners.W
        }
    };
}

function visibleMoveCount() {
    return reviewIndex === null ? moves.length : reviewIndex;
}

function colorAt(x, y, limit = visibleMoveCount()) {
    const state = gameStates[limit];
    return state ? state.board[y][x] : 0;
}

function renderBoard() {
    const visibleCount = visibleMoveCount();
    const state = gameStates[visibleCount] || createState();
    const lastMove = visibleCount > 0 ? moves[visibleCount - 1] : null;
    const captures = lastMove && lastMove.captured ? lastMove.captured : [];
    boardElement.replaceChildren();
    for (let y = 0; y < SIZE; y += 1) {
        for (let x = 0; x < SIZE; x += 1) {
            const point = document.createElement("button");
            point.type = "button";
            point.className = "board-point";
            point.setAttribute("role", "gridcell");
            const stoneColor = colorAt(x, y, visibleCount);
            point.setAttribute("aria-label", `${String.fromCharCode(65 + x + (x >= 8 ? 1 : 0))}${SIZE - y}${stoneColor ? `, quân ${stoneColor === 1 ? "đen" : "trắng"}` : ""}`);
            point.dataset.x = String(x);
            point.dataset.y = String(y);
            if (stoneColor === 0 && STAR_POINTS.has(x) && STAR_POINTS.has(y)) point.classList.add("star-point");
            const wasCaptured = captures.some(captured => captured.x === x && captured.y === y);
            if (wasCaptured) point.classList.add("captured-point");
            if (stoneColor !== 0) {
                point.classList.add("occupied");
                if (lastMove && lastMove.x === x && lastMove.y === y) point.classList.add("last-move");
                const stone = document.createElement("span");
                stone.className = `stone stone-${stoneColor === 1 ? "black" : "white"}`;
                point.append(stone);
            } else if (wasCaptured) {
                const effect = document.createElement("span");
                effect.className = "capture-effect";
                effect.setAttribute("aria-hidden", "true");
                point.append(effect);
            }
            point.disabled = reviewIndex !== null || state.gameOver;
            boardElement.append(point);
        }
    }

    const currentColor = state.turn;
    document.querySelector("#move-counter").textContent = reviewIndex === null
        ? `Nước ${moves.length}`
        : `Xem nước ${visibleCount} / ${moves.length}`;
    document.querySelector("#board-mode").textContent = reviewIndex !== null ? "Đang xem lại" : state.gameOver ? "Đã kết thúc" : "Đang chơi";
    document.querySelector("#turn-label").textContent = reviewIndex === null
        ? (state.gameOver ? "Ván đã kết thúc" : currentColor === "B" ? "Quân đen" : "Quân trắng")
        : (visibleCount === 0 ? "Chưa có nước đi" : `Nước ${visibleCount} · ${moves[visibleCount - 1].color === "B" ? "Đen" : "Trắng"}`);
    document.querySelector("#turn-hint").textContent = reviewIndex !== null
        ? "Đang phát lại kỳ phổ"
        : (state.gameOver ? "Hai bên đã bỏ lượt liên tiếp." : moves.length === 0 ? "Đặt nước đi đầu tiên nhé!" : "Sẵn sàng cho nước tiếp theo!");
    document.querySelector("#turn-stone").classList.toggle("white-turn", currentColor === "W");
    document.querySelector("#black-prisoners").textContent = String(state.prisoners.B);
    document.querySelector("#white-prisoners").textContent = String(state.prisoners.W);
    const scoreResult = document.querySelector("#score-result");
    scoreResult.hidden = !state.gameOver;
    if (state.gameOver) {
        const score = calculateScore(state);
        const winner = score.total.B === score.total.W ? "Hòa điểm!" : `Quân ${score.total.B > score.total.W ? "đen" : "trắng"} thắng!`;
        scoreResult.textContent = `${winner} · Đất đen ${score.territory.B} + tù binh ${state.prisoners.B} = ${score.total.B} | Đất trắng ${score.territory.W} + tù binh ${state.prisoners.W} = ${score.total.W}`;
    }
    document.querySelector("#undo-move").disabled = moves.length === 0 || reviewIndex !== null;
    document.querySelector("#review-prev").disabled = reviewIndex === null || reviewIndex === 0;
    document.querySelector("#review-next").disabled = reviewIndex === null || reviewIndex >= moves.length;
    document.querySelector("#review-play").textContent = reviewIndex === null
        ? "▶ Xem lại"
        : (playTimer ? "⏹ Dừng" : "▶ Phát tiếp");
    document.querySelector("#pass-turn").disabled = reviewIndex !== null || state.gameOver;
    if (reviewIndex === null) {
        const capturedCount = lastMove && lastMove.captured ? lastMove.captured.length : 0;
        statusElement.textContent = state.gameOver
            ? "Ván cờ kết thúc · điểm tính theo đất và tù binh."
            : capturedCount
                ? `Bắt được ${capturedCount} quân! · Đến lượt quân ${currentColor === "B" ? "đen" : "trắng"}.`
                : `Đến lượt quân ${currentColor === "B" ? "đen" : "trắng"} · Chạm giao điểm để đặt quân.`;
    } else {
        statusElement.textContent = visibleCount === 0
            ? "Đang ở vị trí bắt đầu ván cờ."
            : `Nước ${visibleCount}: quân ${moves[visibleCount - 1].color === "B" ? "đen" : "trắng"}.`;
    }
}

function renderSavedGames() {
    const list = document.querySelector("#saved-games");
    list.replaceChildren();
    document.querySelector("#saved-count").textContent = `${savedGames.length} ${savedGames.length === 1 ? "ván" : "ván"}`;
    const query = document.querySelector("#archive-search").value.trim().toLocaleLowerCase("vi");
    const filteredGames = savedGames.slice().reverse().filter(game => game.title.toLocaleLowerCase("vi").includes(query));
    if (filteredGames.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-games";
        empty.textContent = savedGames.length === 0
            ? "Kho đang trống. Hãy lưu ván đầu tiên của bạn từ bảng bên trên."
            : "Không tìm thấy kỳ phổ phù hợp.";
        list.append(empty);
        return;
    }
    filteredGames.forEach(game => {
        const row = document.createElement("article");
        row.className = "archive-card";
        const info = document.createElement("div");
        info.className = "archive-card-info";
        const title = document.createElement("h3");
        title.textContent = game.title;
        const details = document.createElement("p");
        const date = game.updatedAt && !Number.isNaN(Date.parse(game.updatedAt))
            ? new Date(game.updatedAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
            : "Ngày lưu không xác định";
        details.textContent = `${game.moves.length} nước đi · ${date}`;
        info.append(title, details);
        const actions = document.createElement("div");
        actions.className = "archive-card-actions";
        const load = document.createElement("button");
        load.type = "button";
        load.className = "archive-action archive-open";
        load.textContent = "▶ Xem lại";
        load.title = "Mở kỳ phổ này";
        load.addEventListener("click", () => {
            stopReview();
            try {
                const replay = rebuildGameStates(game.moves, true);
                moves = replay.moves;
                gameStates = replay.states;
            } catch (error) {
                showToast(error.message);
                return;
            }
            gameTitle.value = game.title;
            persistDraft();
            reviewIndex = moves.length;
            renderBoard();
            showToast(`Đã mở kỳ phổ “${game.title}”.`);
        });
        const exportButton = document.createElement("button");
        exportButton.type = "button";
        exportButton.className = "archive-action";
        exportButton.textContent = "↓ SGF";
        exportButton.title = "Tải kỳ phổ này dạng SGF";
        exportButton.addEventListener("click", () => downloadSgf(game.title, game.moves));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "archive-action archive-delete";
        remove.textContent = "Xóa";
        remove.setAttribute("aria-label", `Xóa kỳ phổ ${game.title}`);
        remove.addEventListener("click", () => {
            savedGames = savedGames.filter(item => item.id !== game.id);
            persistGames();
            showToast("Đã xóa kỳ phổ khỏi thiết bị.");
        });
        actions.append(load, exportButton, remove);
        row.append(info, actions);
        list.append(row);
    });
}

function stopReview() {
    window.clearInterval(playTimer);
    playTimer = undefined;
    reviewIndex = null;
}

function saveGame() {
    if (moves.length === 0) {
        showToast("Hãy đặt ít nhất một quân trước khi lưu ván nhé.");
        return;
    }
    const title = gameTitle.value.trim() || `Ván cờ ${new Date().toLocaleDateString("vi-VN")}`;
    const existing = savedGames.findIndex(game => game.title === title);
    const id = existing >= 0
        ? savedGames[existing].id
        : (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const record = { id, title, moves: moves.map(move => ({ ...move })), updatedAt: new Date().toISOString() };
    if (existing >= 0) savedGames.splice(existing, 1);
    savedGames.push(record);
    gameTitle.value = title;
    persistGames();
    persistDraft();
    showToast("Đã lưu kỳ phổ trên thiết bị này.");
}

function sgfEscape(value) {
    return value.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
}

function exportSgf() {
    const title = gameTitle.value.trim() || "Van co Vay Vui";
    downloadSgf(title, moves);
    showToast("Đã xuất kỳ phổ thành file SGF.");
}

function downloadSgf(title, gameMoves) {
    const nodes = gameMoves.map(move => `;${move.color}[${move.pass ? "" : `${String.fromCharCode(97 + move.x)}${String.fromCharCode(97 + move.y)}`}]`).join("");
    const content = `(;GM[1]FF[4]CA[UTF-8]AP[VayVui:1]SZ[19]GN[${sgfEscape(title)}]${nodes})`;
    const blob = new Blob([content], { type: "application/x-go-sgf;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").slice(0, 60) || "ky-pho"}.sgf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseSgf(text) {
    const boardSize = text.match(/\bSZ\[(\d+)\]/i);
    if (boardSize && Number(boardSize[1]) !== SIZE) throw new Error("Hiện chỉ hỗ trợ kỳ phổ bàn cờ 19×19.");
    const titleMatch = text.match(/\bGN\[((?:\\.|[^\]])*)\]/i);
    const title = titleMatch ? titleMatch[1].replace(/\\([\\\]])/g, "$1") : "Kỳ phổ đã nhập";
    const moves = [];
    const nodePattern = /;([BW])\[((?:\\.|[^\]])*)\]/gi;
    let match;
    while ((match = nodePattern.exec(text)) !== null) {
        const value = match[2].replace(/\\([\\\]])/g, "$1");
        if (value === "") {
            moves.push({ pass: true, color: match[1].toUpperCase() });
            continue;
        }
        if (value.length !== 2) throw new Error("Kỳ phổ có tọa độ nước đi không hợp lệ.");
        const x = value.charCodeAt(0) - 97;
        const y = value.charCodeAt(1) - 97;
        if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) throw new Error("Kỳ phổ có nước đi nằm ngoài bàn cờ 19×19.");
            moves.push({ x, y, color: match[1].toUpperCase() });
    }
    if (!moves.length) throw new Error("Không tìm thấy nước đi nào trong file SGF.");
    return { title, moves };
}

boardElement.addEventListener("click", event => {
    const point = event.target.closest(".board-point");
    if (!point || reviewIndex !== null || gameStates[moves.length].gameOver) return;
    const x = Number(point.dataset.x);
    const y = Number(point.dataset.y);
    const move = { x, y, color: gameStates[moves.length].turn };
    try {
        const result = applyMove(gameStates[moves.length], move);
        move.captured = result.captured;
        moves.push(move);
        gameStates.push(result.state);
        persistDraft();
        renderBoard();
    } catch (error) {
        showToast(error.message);
    }
});

document.querySelector("#undo-move").addEventListener("click", () => {
    if (moves.length === 0 || reviewIndex !== null) return;
    moves.pop();
    gameStates.pop();
    persistDraft();
    renderBoard();
});
document.querySelector("#pass-turn").addEventListener("click", () => {
    if (reviewIndex !== null || gameStates[moves.length].gameOver) return;
    const move = { pass: true, color: gameStates[moves.length].turn };
    const result = applyMove(gameStates[moves.length], move);
    moves.push(move);
    gameStates.push(result.state);
    persistDraft();
    renderBoard();
    if (result.state.gameOver) showToast("Hai bên đã bỏ lượt liên tiếp. Ván cờ kết thúc!");
});
document.querySelector("#new-game").addEventListener("click", () => {
    stopReview();
    moves = [];
    gameStates = [createState()];
    gameTitle.value = "";
    persistDraft();
    renderBoard();
    showToast("Bàn cờ mới đã sẵn sàng.");
});
document.querySelector("#save-game").addEventListener("click", saveGame);
document.querySelector("#export-sgf").addEventListener("click", exportSgf);
document.querySelector("#import-sgf").addEventListener("click", () => document.querySelector("#sgf-file").click());
document.querySelector("#sgf-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        if (file.size > 2_000_000) throw new Error("File quá lớn (tối đa 2 MB).");
        const imported = parseSgf(await file.text());
        const replay = rebuildGameStates(imported.moves, true);
        stopReview();
        moves = replay.moves;
        gameStates = replay.states;
        gameTitle.value = imported.title;
        persistDraft();
        reviewIndex = moves.length;
        renderBoard();
        showToast(`Đã nhập kỳ phổ gồm ${moves.length} nước đi.`);
    } catch (error) {
        showToast(`Không thể nhập SGF: ${error.message}`);
    } finally {
        event.target.value = "";
    }
});
document.querySelector("#review-prev").addEventListener("click", () => {
    if (reviewIndex === null) return;
    reviewIndex = Math.max(0, reviewIndex - 1);
    renderBoard();
});
document.querySelector("#review-next").addEventListener("click", () => {
    if (reviewIndex === null) return;
    reviewIndex = Math.min(moves.length, reviewIndex + 1);
    renderBoard();
});
document.querySelector("#review-play").addEventListener("click", () => {
    if (reviewIndex === null) {
        if (moves.length === 0) {
            showToast("Chưa có nước đi nào để xem lại.");
            return;
        }
        reviewIndex = 0;
        renderBoard();
    }
    if (playTimer) {
        stopReview();
        reviewIndex = null;
        renderBoard();
        return;
    }
    if (reviewIndex >= moves.length) reviewIndex = 0;
    playTimer = window.setInterval(() => {
        if (reviewIndex >= moves.length) {
            window.clearInterval(playTimer);
            playTimer = undefined;
            renderBoard();
            return;
        }
        reviewIndex += 1;
        renderBoard();
        if (reviewIndex >= moves.length) {
            window.clearInterval(playTimer);
            playTimer = undefined;
            renderBoard();
        }
    }, 850);
    renderBoard();
});

document.querySelectorAll(".support-open").forEach(button => button.addEventListener("click", () => supportDialog.showModal()));
document.querySelector("#login-open").addEventListener("click", () => {
    const profile = readProfile();
    document.querySelector("#display-name").value = profile ? profile.name : "";
    document.querySelector("#logout-button").hidden = !profile;
    loginDialog.showModal();
});
document.querySelector("#login-form").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.querySelector("#display-name").value.trim();
    if (!name) return;
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ name }));
        document.querySelector("#login-open").textContent = `👋 ${name}`;
        document.querySelector("#login-message").textContent = "Hồ sơ đã lưu trên thiết bị này!";
        window.setTimeout(() => loginDialog.close(), 700);
    } catch (error) {
        document.querySelector("#login-message").textContent = `Không thể lưu hồ sơ: ${error.message}`;
    }
});
document.querySelector("#logout-button").addEventListener("click", () => {
    try {
        localStorage.removeItem(PROFILE_KEY);
    } catch (error) {
        showToast(`Không thể xóa hồ sơ: ${error.message}`);
        return;
    }
    document.querySelector("#login-open").textContent = "Đăng nhập";
    loginDialog.close();
    showToast("Đã xóa hồ sơ khỏi thiết bị.");
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll(".app-dialog").forEach(dialog => dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
}));
document.querySelector("#menu-toggle").addEventListener("click", event => {
    const nav = document.querySelector("#mobile-nav");
    const open = nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
    event.currentTarget.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
});
document.querySelectorAll("#mobile-nav a").forEach(link => link.addEventListener("click", () => {
    document.querySelector("#mobile-nav").classList.remove("open");
    document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
}));
document.querySelector("#contact-form").addEventListener("submit", event => {
    event.preventDefault();
    document.querySelector("#contact-note").textContent = "Thông tin đã hợp lệ. Đây là bản xem trước nên chưa gửi dữ liệu tới ban tổ chức.";
    showToast("Đã kiểm tra biểu mẫu. Cần kết nối email hoặc máy chủ để nhận đăng ký.");
});
document.querySelector("#archive-search").addEventListener("input", renderSavedGames);
document.querySelector("#theme-toggle").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
});
const lessonTabs = [...document.querySelectorAll(".lesson-tab")];
lessonTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateLessonTab(tab));
    tab.addEventListener("keydown", event => {
        let nextIndex;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % lessonTabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + lessonTabs.length) % lessonTabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = lessonTabs.length - 1;
        else return;
        event.preventDefault();
        activateLessonTab(lessonTabs[nextIndex], true);
    });
});
window.addEventListener("resize", () => {
    const selectedTab = document.querySelector(".lesson-tab[aria-selected='true']");
    if (selectedTab) activateLessonTab(selectedTab);
});
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        const selectedTab = document.querySelector(".lesson-tab[aria-selected='true']");
        if (selectedTab) activateLessonTab(selectedTab);
    });
}

initializeTheme();
activateLessonTab(document.querySelector(".lesson-tab.active"));
savedGames = readGames();
renderSavedGames();
const draft = readDraft();
gameStates = [createState()];
if (draft) {
    const replay = rebuildGameStates(draft.moves);
    moves = replay.moves;
    gameStates = replay.states;
    gameTitle.value = draft.title;
}
const profile = readProfile();
if (profile) document.querySelector("#login-open").textContent = `👋 ${profile.name}`;
renderBoard();
