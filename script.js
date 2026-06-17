document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const modalClose = document.getElementById("modalClose");
  const accountKey = "nanocat-account";
  const tokenKey = "nanocat-token";
  const mailUrl = "mail/index.html";
  const loginUrl = "login.html";
  const API_BASE = "/api";

  // ---------- 读取本地登录状态 ----------
  let account = null;
  try {
    account = JSON.parse(localStorage.getItem(accountKey));
  } catch {
    account = null;
  }

  const token = localStorage.getItem(tokenKey);

  // 如果有 token，验证是否仍然有效
  if (token && account) {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const me = await res.json();
        account = me;
        localStorage.setItem(accountKey, JSON.stringify(me));
      } else {
        // token 无效，清除
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(accountKey);
        account = null;
      }
    } catch {
      // 离线或 API 不可达，信任本地状态
    }
  }

  // ---------- 更新导航栏登录按钮 ----------
  if (loginBtn) {
    if (account && account.email) {
      loginBtn.textContent = account.displayName || account.email.split("@")[0];
      loginBtn.href = mailUrl;
      loginBtn.title = "进入 NanoCat Mail";
      loginBtn.classList.add("logged-in");

      // 如果当前就在 login.html，跳转到邮箱
      if (window.location.pathname.endsWith("login.html")) {
        window.location.href = mailUrl;
      }
    } else {
      loginBtn.textContent = "登录";
      loginBtn.href = loginUrl;
      loginBtn.title = "登录 NanoCat Mail";
      loginBtn.classList.remove("logged-in");
    }
  }

  // ---------- 管理员专属：导航栏显示管理链接 ----------
  if (account && account.role === "admin") {
    const nav = loginBtn ? loginBtn.parentElement : null;
    if (nav && !document.getElementById("adminNavLink")) {
      const adminLink = document.createElement("a");
      adminLink.id = "adminNavLink";
      adminLink.href = "admin.html";
      adminLink.textContent = "管理";
      adminLink.style.color = "#f59e0b";
      nav.insertBefore(adminLink, loginBtn);
    }
  }

  // ---------- 登录弹窗（旧版提示，改为引导至登录页）----------
  if (loginBtn && loginModal) {
    loginBtn.addEventListener("click", (e) => {
      if (account && account.email) {
        // 已登录，去邮箱
        e.preventDefault();
        window.location.href = mailUrl;
      } else {
        // 未登录，展示弹窗引导
        e.preventDefault();
        loginModal.classList.add("active");
      }
    });
  }

  if (modalClose && loginModal) {
    modalClose.addEventListener("click", () => {
      loginModal.classList.remove("active");
    });
  }

  if (loginModal) {
    loginModal.addEventListener("click", (event) => {
      if (event.target === loginModal) {
        loginModal.classList.remove("active");
      }
    });
  }
});
