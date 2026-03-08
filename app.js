// ── App.js – Main logic for index.html ──

const DEFAULT_MSG = `Mời bạn đến với buổi vui chơi chào nhân dịp Ngày Quốc tế phụ nữ của ITA22 nhé! 🌸\n\nChúc bạn luôn xinh đẹp, hạnh phúc và rạng rỡ! 💐`;

// Tạo hiệu ứng cánh hoa rơi
function createPetals() {
    const container = document.getElementById('petals');
    if (!container) return;
    const symbols = ['🌸', '🌺', '🌷', '💮', '🏵️', '🌹', '💐'];
    for (let i = 0; i < 22; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = (4 + Math.random() * 6) + 's';
        petal.style.animationDelay = (Math.random() * 8) + 's';
        petal.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
        container.appendChild(petal);
    }
}

// Tra cứu học sinh theo số thứ tự
function lookupStudent() {
    const input = document.getElementById('student-num');
    const errEl = document.getElementById('error-msg');
    const num = parseInt(input.value);

    // Validate
    if (!input.value || isNaN(num) || num < 1 || num > 34) {
        errEl.style.display = 'block';
        errEl.textContent = '⚠️ Vui lòng nhập số thứ tự hợp lệ từ 1 đến 34!';
        input.focus();
        return;
    }
    errEl.style.display = 'none';

    // Load data
    const data = loadStudentData();
    const student = data.find(s => s.id === num);
    if (!student) {
        errEl.style.display = 'block';
        errEl.textContent = '❌ Không tìm thấy thông tin. Vui lòng thử lại!';
        return;
    }

    // Điền thông tin vào card
    const photoEl = document.getElementById('card-photo');
    photoEl.src = student.photo || 'photos/default.jpg';
    photoEl.onerror = function () { this.src = 'photos/default.jpg'; };

    document.getElementById('card-name').textContent = student.name;
    document.getElementById('card-id').textContent = `(${String(num).padStart(2, '0')})`;
    document.getElementById('card-msg').innerHTML = (student.message || DEFAULT_MSG).replace(/\n/g, '<br/>');

    // Chuyển màn hình
    document.getElementById('screen-input').style.display = 'none';
    document.getElementById('screen-card').style.display = 'flex';

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    document.getElementById('screen-card').style.display = 'none';
    document.getElementById('screen-input').style.display = 'flex';
    document.getElementById('student-num').value = '';
    document.getElementById('student-num').focus();
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    createPetals();
    const input = document.getElementById('student-num');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') lookupStudent();
        });
        input.focus();
    }
});
