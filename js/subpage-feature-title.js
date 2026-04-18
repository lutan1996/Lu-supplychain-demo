/**
 * 子页统一演示弹窗：showActionPrompt / showActionConfirm / showActionModal
 * 供收货入库、仓库管理、闲置物资、扫码领用等页面使用。
 */
(function (global) {
  var STYLE_ID = "subpage-feature-title-styles";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent =
      ".sap-overlay{position:fixed;inset:0;background:rgba(15,25,45,0.45);backdrop-filter:blur(2px);display:none;align-items:center;justify-content:center;z-index:10050;padding:20px;box-sizing:border-box;}" +
      ".sap-overlay.sap-open{display:flex;}" +
      ".sap-box{width:min(440px,100%);background:#fff;border-radius:10px;border:1px solid #e8ecf0;box-shadow:0 12px 40px rgba(15,35,70,0.14);overflow:hidden;display:flex;flex-direction:column;max-height:min(90vh,640px);}" +
      ".sap-head{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 16px;min-height:48px;border-bottom:1px solid #f0f2f5;}" +
      ".sap-title{margin:0;font-size:16px;font-weight:600;color:#1f3551;}" +
      ".sap-close{border:none;background:transparent;font-size:22px;line-height:1;color:#8c9aad;cursor:pointer;padding:4px 8px;border-radius:4px;font-family:inherit;}" +
      ".sap-close:hover{color:#1f3551;background:#f5f7fa;}" +
      ".sap-body{padding:16px 18px;font-size:13px;color:#3f5366;overflow-y:auto;}" +
      ".sap-body p{margin:0;line-height:1.65;}" +
      ".sap-label{display:block;margin-bottom:6px;color:#516a87;}" +
      ".sap-input{width:100%;height:34px;border:1px solid #d9d9d9;border-radius:6px;padding:0 10px;font-size:13px;box-sizing:border-box;font-family:inherit;margin-top:4px;}" +
      ".sap-input:focus{border-color:#1890ff;outline:none;box-shadow:0 0 0 2px rgba(24,144,255,0.12);}" +
      ".sap-foot{flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid #f0f2f5;background:#fafbfd;}" +
      ".sap-btn{min-height:32px;padding:0 16px;font-size:13px;border-radius:6px;cursor:pointer;font-family:inherit;box-sizing:border-box;}" +
      ".sap-btn--ghost{background:#fff;border:1px solid #d9d9d9;color:rgba(0,0,0,0.85);}" +
      ".sap-btn--ghost:hover{border-color:#1890ff;color:#1890ff;}" +
      ".sap-btn--primary{background:#1890ff;border:1px solid #1890ff;color:#fff;}" +
      ".sap-btn--primary:hover{background:#40a9ff;border-color:#40a9ff;}";
    document.head.appendChild(s);
  }

  var openStack = 0;

  function lockScroll() {
    openStack++;
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    openStack = Math.max(0, openStack - 1);
    if (openStack === 0) document.body.style.overflow = "";
  }

  function showActionConfirm(title, message, onOk) {
    ensureStyles();
    var overlay = document.createElement("div");
    overlay.className = "sap-overlay sap-open";
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "false");
    overlay.innerHTML =
      '<div class="sap-box" role="dialog">' +
      '<div class="sap-head"><h3 class="sap-title"></h3><button type="button" class="sap-close" aria-label="关闭">×</button></div>' +
      '<div class="sap-body"><p></p></div>' +
      '<div class="sap-foot">' +
      '<button type="button" class="sap-btn sap-btn--ghost sap-cancel">取消</button>' +
      '<button type="button" class="sap-btn sap-btn--primary sap-ok">确定</button>' +
      "</div></div>";
    overlay.querySelector(".sap-title").textContent = title || "提示";
    overlay.querySelector(".sap-body p").textContent = message || "";

    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }

    function close() {
      document.removeEventListener("keydown", onKey);
      overlay.classList.remove("sap-open");
      overlay.setAttribute("aria-hidden", "true");
      unlockScroll();
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 0);
    }

    function onCancel() {
      close();
    }
    function onConfirm() {
      close();
      if (typeof onOk === "function") onOk();
    }

    overlay.querySelector(".sap-close").addEventListener("click", onCancel);
    overlay.querySelector(".sap-cancel").addEventListener("click", onCancel);
    overlay.querySelector(".sap-ok").addEventListener("click", onConfirm);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) onCancel();
    });

    lockScroll();
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
  }

  function showActionPrompt(title, promptText, defaultValue, callback) {
    ensureStyles();
    var overlay = document.createElement("div");
    overlay.className = "sap-overlay sap-open";
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "false");
    overlay.innerHTML =
      '<div class="sap-box" role="dialog">' +
      '<div class="sap-head"><h3 class="sap-title"></h3><button type="button" class="sap-close" aria-label="关闭">×</button></div>' +
      '<div class="sap-body"><label class="sap-label"></label><input type="text" class="sap-input" autocomplete="off" /></div>' +
      '<div class="sap-foot">' +
      '<button type="button" class="sap-btn sap-btn--ghost sap-cancel">取消</button>' +
      '<button type="button" class="sap-btn sap-btn--primary sap-ok">确定</button>' +
      "</div></div>";
    overlay.querySelector(".sap-title").textContent = title || "输入";
    overlay.querySelector(".sap-label").textContent = promptText || "";
    var inp = overlay.querySelector(".sap-input");
    inp.value = defaultValue != null ? String(defaultValue) : "";

    function close() {
      overlay.classList.remove("sap-open");
      overlay.setAttribute("aria-hidden", "true");
      unlockScroll();
      document.removeEventListener("keydown", onKey);
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 0);
    }

    function submit() {
      var v = inp ? inp.value : "";
      close();
      if (typeof callback === "function") callback(v);
    }

    function onCancel() {
      close();
    }

    overlay.querySelector(".sap-close").addEventListener("click", onCancel);
    overlay.querySelector(".sap-cancel").addEventListener("click", onCancel);
    overlay.querySelector(".sap-ok").addEventListener("click", submit);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) onCancel();
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });

    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);

    lockScroll();
    document.body.appendChild(overlay);
    setTimeout(function () {
      inp.focus();
      inp.select();
    }, 0);
  }

  /** 与 showActionConfirm 相同：标题 + 说明 + 确定/取消 */
  function showActionModal(title, message, onOk) {
    showActionConfirm(title, message, onOk);
  }

  global.showActionConfirm = showActionConfirm;
  global.showActionPrompt = showActionPrompt;
  global.showActionModal = showActionModal;
})(typeof window !== "undefined" ? window : this);
