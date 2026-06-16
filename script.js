document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    const accountKey = 'nanocat-account';
    const mailUrl = 'mail/index.html';
    const loginUrl = `login.html?next=${encodeURIComponent(mailUrl)}`;

    let account = null;
    try {
        account = JSON.parse(localStorage.getItem(accountKey));
    } catch (error) {
        account = null;
    }

    if (loginBtn) {
        if (account && account.email) {
            loginBtn.textContent = account.displayName || account.email;
            loginBtn.href = mailUrl;
            loginBtn.title = '进入 NanoCat Mail';
            loginBtn.classList.add('logged-in');
        } else {
            loginBtn.textContent = '登录';
            loginBtn.href = loginUrl;
            loginBtn.title = '登录 NanoCat Mail';
            loginBtn.classList.remove('logged-in');
        }
    }

    if (modalClose && loginModal) {
        modalClose.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
});
