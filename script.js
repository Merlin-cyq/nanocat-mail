document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');

    // 点击登录按钮打开弹窗
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('active');
        });
    }

    // 点击叉号关闭弹窗
    if (modalClose && loginModal) {
        modalClose.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    // 点击弹窗外部空白处也能关闭弹窗
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
});