const storageKey = "nanocat-mail-demo";

const starterMail = [
  {
    id: "m-1001",
    folder: "inbox",
    from: "NanoCat System <system@nanocat.xin>",
    to: "admin@nanocat.xin",
    subject: "欢迎来到 NanoCat Mail",
    body: "你的私人邮箱社区入口已经准备好了。\n\n这一版 App 支持收件箱、星标、归档、草稿、本地发送记录和搜索。后续接入真实邮件服务后，可以把这里的数据源换成 IMAP/SMTP 或后端 API。",
    time: "今天 16:20",
    unread: true,
    starred: true
  },
  {
    id: "m-1002",
    folder: "inbox",
    from: "站长 <admin@nanocat.xin>",
    to: "hello@nanocat.xin",
    subject: "邀请码系统需求草稿",
    body: "第一阶段先做手动审核：\n\n1. 用户填写想要的邮箱前缀\n2. 提交联系方式和申请理由\n3. 后台审核后发放邀请码\n4. 用户用邀请码激活邮箱\n\n等邮箱服务稳定后，再开放自动验证。",
    time: "昨天 22:18",
    unread: false,
    starred: false
  },
  {
    id: "m-1003",
    folder: "inbox",
    from: "Cloudflare Pages <pages@cloudflare.com>",
    to: "admin@nanocat.xin",
    subject: "部署成功：nanocat.xin",
    body: "网站已经成功部署。\n\n建议下一步添加 favicon、Open Graph 分享图、状态页和申请表单。",
    time: "6月15日",
    unread: true,
    starred: false
  },
  {
    id: "m-1004",
    folder: "archive",
    from: "beta@nanocat.xin",
    to: "admin@nanocat.xin",
    subject: "Beta 名单整理",
    body: "可以先邀请 5 到 10 个熟人测试登录、收信、发信、垃圾邮件过滤和移动端体验。",
    time: "6月14日",
    unread: false,
    starred: false
  }
];

const state = {
  folder: "inbox",
  selectedId: null,
  unreadOnly: false,
  query: "",
  mails: loadMail()
};

const folderLabels = {
  inbox: ["收件箱", "整理你的 NanoCat 邮件"],
  starred: ["星标", "重要邮件集中处理"],
  sent: ["已发送", "查看你发出的邮件"],
  drafts: ["草稿", "继续写还没发出的内容"],
  archive: ["归档", "已经处理过的邮件"]
};

const els = {
  folderTitle: document.getElementById("folderTitle"),
  folderSubtitle: document.getElementById("folderSubtitle"),
  mailList: document.getElementById("mailList"),
  reader: document.getElementById("reader"),
  searchInput: document.getElementById("searchInput"),
  composeButton: document.getElementById("composeButton"),
  composer: document.getElementById("composer"),
  closeComposer: document.getElementById("closeComposer"),
  composeForm: document.getElementById("composeForm"),
  toInput: document.getElementById("toInput"),
  subjectInput: document.getElementById("subjectInput"),
  bodyInput: document.getElementById("bodyInput"),
  saveDraftButton: document.getElementById("saveDraftButton"),
  selectUnreadButton: document.getElementById("selectUnreadButton"),
  refreshButton: document.getElementById("refreshButton"),
  toast: document.getElementById("toast")
};

function loadMail() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return starterMail;

  try {
    return JSON.parse(saved);
  } catch {
    return starterMail;
  }
}

function saveMail() {
  localStorage.setItem(storageKey, JSON.stringify(state.mails));
}

function render() {
  const [title, subtitle] = folderLabels[state.folder];
  els.folderTitle.textContent = title;
  els.folderSubtitle.textContent = subtitle;

  document.querySelectorAll(".folder").forEach((button) => {
    button.classList.toggle("active", button.dataset.folder === state.folder);
  });

  renderCounts();
  renderList();
  renderReader();
}

function renderCounts() {
  const countByFolder = (folder) => state.mails.filter((mail) => mail.folder === folder).length;
  document.getElementById("inboxCount").textContent = state.mails.filter((mail) => mail.folder === "inbox" && mail.unread).length;
  document.getElementById("starredCount").textContent = state.mails.filter((mail) => mail.starred).length;
  document.getElementById("sentCount").textContent = countByFolder("sent");
  document.getElementById("draftCount").textContent = countByFolder("drafts");
  document.getElementById("archiveCount").textContent = countByFolder("archive");
}

function visibleMail() {
  const query = state.query.trim().toLowerCase();
  return state.mails.filter((mail) => {
    const inFolder = state.folder === "starred" ? mail.starred : mail.folder === state.folder;
    const isUnread = !state.unreadOnly || mail.unread;
    const haystack = [mail.from, mail.to, mail.subject, mail.body].join(" ").toLowerCase();
    return inFolder && isUnread && (!query || haystack.includes(query));
  });
}

function renderList() {
  const mails = visibleMail();
  if (!mails.length) {
    els.mailList.innerHTML = '<div class="empty-list">这里暂时没有邮件。</div>';
    return;
  }

  els.mailList.innerHTML = mails.map((mail) => `
    <button class="mail-item ${mail.unread ? "unread" : ""} ${mail.id === state.selectedId ? "active" : ""}" type="button" data-id="${mail.id}">
      <div class="mail-meta">
        <span>${escapeHtml(shortName(mail.from))}</span>
        <time>${escapeHtml(mail.time)}</time>
      </div>
      <div class="mail-subject">
        ${mail.starred ? '<span class="star">★</span>' : ""}
        <span>${escapeHtml(mail.subject)}</span>
      </div>
      <p class="mail-preview">${escapeHtml(mail.body.slice(0, 76))}${mail.body.length > 76 ? "..." : ""}</p>
    </button>
  `).join("");
}

function renderReader() {
  const mail = state.mails.find((item) => item.id === state.selectedId);
  if (!mail) {
    els.reader.innerHTML = `
      <div class="empty-reader">
        <span class="empty-mark">N</span>
        <h2>选择一封邮件</h2>
        <p>阅读、星标、归档或快速回复。</p>
      </div>
    `;
    return;
  }

  els.reader.innerHTML = `
    <header class="reader-header">
      <div class="reader-actions">
        <button type="button" data-action="star">${mail.starred ? "取消星标" : "星标"}</button>
        <button type="button" data-action="archive">${mail.folder === "archive" ? "移回收件箱" : "归档"}</button>
        <button type="button" data-action="unread">${mail.unread ? "标为已读" : "标为未读"}</button>
        <button type="button" data-action="reply">回复</button>
      </div>
      <h2>${escapeHtml(mail.subject)}</h2>
      <div class="reader-from">
        <span>发件人：${escapeHtml(mail.from)}</span>
        <time>${escapeHtml(mail.time)}</time>
      </div>
    </header>
    <div class="reader-body">${escapeHtml(mail.body)}</div>
  `;
}

function selectMail(id) {
  state.selectedId = id;
  const mail = state.mails.find((item) => item.id === id);
  if (mail) mail.unread = false;
  saveMail();
  render();
}

function mutateSelected(action) {
  const mail = state.mails.find((item) => item.id === state.selectedId);
  if (!mail) return;

  if (action === "star") mail.starred = !mail.starred;
  if (action === "archive") mail.folder = mail.folder === "archive" ? "inbox" : "archive";
  if (action === "unread") mail.unread = !mail.unread;
  if (action === "reply") openComposer(mail);

  if (action !== "reply") {
    saveMail();
    render();
  }
}

function openComposer(replyTo) {
  els.composer.classList.add("open");
  els.composer.setAttribute("aria-hidden", "false");

  if (replyTo) {
    els.toInput.value = parseAddress(replyTo.from);
    els.subjectInput.value = replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`;
    els.bodyInput.value = `\n\n---- 原邮件 ----\n${replyTo.body}`;
  }

  setTimeout(() => els.toInput.focus(), 50);
}

function closeComposer() {
  els.composer.classList.remove("open");
  els.composer.setAttribute("aria-hidden", "true");
}

function addMail(mail) {
  state.mails.unshift(mail);
  saveMail();
  render();
}

function saveDraft() {
  if (!els.toInput.value && !els.subjectInput.value && !els.bodyInput.value) {
    showToast("草稿是空的。");
    return;
  }

  addMail({
    id: crypto.randomUUID(),
    folder: "drafts",
    from: "站长 <admin@nanocat.xin>",
    to: els.toInput.value || "未填写",
    subject: els.subjectInput.value || "无主题",
    body: els.bodyInput.value || "空白草稿",
    time: "刚刚",
    unread: false,
    starred: false
  });
  showToast("草稿已保存。");
  closeComposer();
  els.composeForm.reset();
}

function sendMail(event) {
  event.preventDefault();

  addMail({
    id: crypto.randomUUID(),
    folder: "sent",
    from: "站长 <admin@nanocat.xin>",
    to: els.toInput.value,
    subject: els.subjectInput.value,
    body: els.bodyInput.value,
    time: "刚刚",
    unread: false,
    starred: false
  });

  showToast("演示发送成功，邮件已放入已发送。");
  closeComposer();
  els.composeForm.reset();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function shortName(value) {
  return value.split("<")[0].trim();
}

function parseAddress(value) {
  const match = value.match(/<([^>]+)>/);
  return match ? match[1] : value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".folder").forEach((button) => {
  button.addEventListener("click", () => {
    state.folder = button.dataset.folder;
    state.selectedId = null;
    state.unreadOnly = false;
    render();
  });
});

els.mailList.addEventListener("click", (event) => {
  const item = event.target.closest(".mail-item");
  if (item) selectMail(item.dataset.id);
});

els.reader.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) mutateSelected(button.dataset.action);
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderList();
});

els.composeButton.addEventListener("click", () => openComposer());
els.closeComposer.addEventListener("click", closeComposer);
els.saveDraftButton.addEventListener("click", saveDraft);
els.composeForm.addEventListener("submit", sendMail);

els.selectUnreadButton.addEventListener("click", () => {
  state.unreadOnly = !state.unreadOnly;
  els.selectUnreadButton.textContent = state.unreadOnly ? "全部" : "未读";
  renderList();
});

els.refreshButton.addEventListener("click", () => {
  showToast("已刷新。演示版使用本地数据。");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeComposer();
});

render();
