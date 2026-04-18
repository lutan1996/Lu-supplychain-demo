/**
 * 列表页统一弹窗（与《各个子功能页面按钮弹窗和跳转页面》文档一致）：
 * - 删除：标题「系统提示」+ 左侧橙色感叹号 + 文案「是否确认删除业务id为【…】的数据项?」+ 取消 / 确定
 * - 新增/修改：宽屏对话框 + 左灰底标签列 + 右输入列（长表格表单）+ 取消 / 确定
 * - 详情：同壳只读表格
 * - 导入：选取文件 + 开始导入
 * 页面根节点 data-list-form-demo="1"，通过 autoBindTablePage 绑定。
 */
(function () {
  var DEMO_USER = "演示用户";

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function nowLocalDatetimeValue() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      pad2(d.getMonth() + 1) +
      "-" +
      pad2(d.getDate()) +
      "T" +
      pad2(d.getHours()) +
      ":" +
      pad2(d.getMinutes())
    );
  }

  function genSerialId() {
    return "NB-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900));
  }

  function demoSnowflakeId() {
    return String(1864000000000000000 + Math.floor(Math.random() * 99999999999999));
  }

  function ensureShell() {
    if (document.getElementById("demoSpecMask")) return;
    var style = document.createElement("style");
    style.id = "demoSpecModalStyle";
    style.textContent =
      "#demoSpecMask{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:10060;padding:16px;box-sizing:border-box;font-family:\"Helvetica Neue\",Helvetica,\"PingFang SC\",\"Microsoft YaHei\",Arial,sans-serif;}" +
      "#demoSpecMask.demo-spec-mask--open{display:flex;}" +
      "#demoSpecDialog{width:min(960px,96vw);max-height:90vh;background:#fff;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden;border:1px solid #ebeef5;}" +
      "#demoSpecHead{flex-shrink:0;height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #ebeef5;background:#fff;}" +
      "#demoSpecTitle{margin:0;font-size:16px;font-weight:500;color:#303133;line-height:1;}" +
      "#demoSpecClose{border:none;background:transparent;cursor:pointer;font-size:18px;line-height:1;color:#909399;padding:4px 6px;border-radius:2px;}" +
      "#demoSpecClose:hover{color:#409eff;}" +
      "#demoSpecScroll{flex:1;min-height:0;overflow:auto;padding:18px 20px;background:#fff;}" +
      "#demoSpecFoot{flex-shrink:0;display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid #ebeef5;background:#fff;}" +
      "#demoSpecFoot .demo-spec-btn{min-width:68px;height:32px;padding:0 14px;font-size:14px;border-radius:4px;cursor:pointer;font-family:inherit;box-sizing:border-box;line-height:1;}" +
      ".demo-spec-btn--default{border:1px solid #dcdfe6;background:#fff;color:#606266;}" +
      ".demo-spec-btn--default:hover{color:#409eff;border-color:#c6e2ff;background:#ecf5ff;}" +
      ".demo-spec-btn--primary{border:1px solid #409eff;background:#409eff;color:#fff;}" +
      ".demo-spec-btn--primary:hover{background:#66b1ff;border-color:#66b1ff;}" +
      ".demo-spec-confirm-body{display:flex;align-items:flex-start;gap:12px;padding:8px 0 4px;}" +
      ".demo-spec-confirm-icon{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#e6a23c;color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1;}" +
      ".demo-spec-confirm-text{flex:1;font-size:14px;color:#606266;line-height:1.6;margin:0;word-break:break-all;}" +
      ".demo-spec-confirm-text strong{color:#303133;font-weight:600;}" +
      "table.demo-spec-form-table{width:100%;border-collapse:collapse;font-size:14px;border:1px solid #ebeef5;}" +
      "table.demo-spec-form-table th.demo-spec-label-cell," +
      "table.demo-spec-form-table td.demo-spec-input-cell{border:1px solid #ebeef5;padding:10px 12px;vertical-align:middle;}" +
      "table.demo-spec-form-table th.demo-spec-label-cell{width:160px;max-width:40%;background:#f5f7fa;color:#606266;font-weight:400;text-align:right;white-space:nowrap;}" +
      "table.demo-spec-form-table td.demo-spec-input-cell{background:#fff;text-align:left;}" +
      ".demo-spec-label-cell .req{color:#f56c6c;margin-right:4px;}" +
      "table.demo-spec-form-table input[type=text],table.demo-spec-form-table input[type=datetime-local],table.demo-spec-form-table select,table.demo-spec-form-table textarea{width:100%;box-sizing:border-box;border:1px solid #dcdfe6;border-radius:4px;padding:8px 10px;font-size:14px;color:#606266;outline:none;}" +
      "table.demo-spec-form-table textarea{min-height:72px;resize:vertical;}" +
      "table.demo-spec-form-table input:read-only,table.demo-spec-form-table textarea:read-only{background:#f5f7fa;color:#909399;}" +
      ".demo-spec-field-err{font-size:12px;color:#f56c6c;margin-top:4px;}" +
      ".demo-spec-dl{margin:0;font-size:14px;color:#606266;}" +
      ".demo-spec-dl dt{color:#909399;margin-top:10px;font-size:13px;}" +
      ".demo-spec-dl dd{margin:4px 0 0;padding:0;color:#303133;}" +
      ".demo-spec-flow{margin:0;padding:0;list-style:none;font-size:13px;color:#606266;}" +
      ".demo-spec-flow li{display:flex;gap:10px;padding:10px 0;border-bottom:1px dashed #ebeef5;}" +
      ".demo-spec-flow li:last-child{border-bottom:none;}" +
      ".demo-spec-flow time{color:#909399;min-width:132px;}" +
      ".demo-spec-import-hint{font-size:13px;color:#909399;margin:0 0 12px;line-height:1.6;}" +
      ".demo-spec-file-row input[type=file]{font-size:13px;}";
    document.head.appendChild(style);

    var mask = document.createElement("div");
    mask.id = "demoSpecMask";
    mask.className = "demo-spec-root";
    mask.setAttribute("role", "presentation");
    mask.innerHTML =
      '<div id="demoSpecDialog" role="dialog" aria-modal="true" aria-labelledby="demoSpecTitle">' +
      '<div id="demoSpecHead"><h2 id="demoSpecTitle"></h2><button type="button" id="demoSpecClose" aria-label="关闭">×</button></div>' +
      '<div id="demoSpecScroll"></div>' +
      '<div id="demoSpecFoot"></div></div>';
    document.body.appendChild(mask);
  }

  function closeMask() {
    var mask = document.getElementById("demoSpecMask");
    if (!mask) return;
    mask.classList.remove("demo-spec-mask--open");
    mask.setAttribute("aria-hidden", "true");
    mask.onclick = null;
    document.removeEventListener("keydown", onEsc);
  }

  function onEsc(e) {
    if (e.key === "Escape") closeMask();
  }

  function openMask() {
    ensureShell();
    var mask = document.getElementById("demoSpecMask");
    mask.classList.add("demo-spec-mask--open");
    mask.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onEsc);
    mask.onclick = function (ev) {
      if (ev.target === mask) closeMask();
    };
    document.getElementById("demoSpecClose").onclick = function () {
      closeMask();
    };
  }

  function footButtons(cancelId, okId, cancelText, okText, okClass) {
    okClass = okClass || "demo-spec-btn--primary";
    return (
      '<button type="button" class="demo-spec-btn demo-spec-btn--default" id="' +
      cancelId +
      '">' +
      (cancelText || "取消") +
      "</button>" +
      '<button type="button" class="demo-spec-btn ' +
      okClass +
      '" id="' +
      okId +
      '">' +
      (okText || "确定") +
      "</button>"
    );
  }

  function keysFromCfgCols(cols) {
    return cols.filter(function (c) {
      return c && c !== "操作";
    });
  }

  function inferKind(label) {
    if (!label) return "text";
    if (/编号|编码|流水|长协编号|协议编号|采购编号|无序号|^ID$|业务id/i.test(label)) return "id";
    if (/时间|日期/.test(label)) return "datetime";
    if (/申报人|创建人|办理人|申请人|采购人|联系人|提报人|负责人|经办人/.test(label)) return "user";
    if (/^是否/.test(label)) return "yesno";
    if (/状态/.test(label)) return "status";
    if (/类型|类别|方式|等级|分类|采购类型|计划类别|接口类型|招标项目类型|协议类型|是否为/.test(label)) return "category";
    if (/附件/.test(label)) return "attach";
    return "text";
  }

  function categoryOptions(label) {
    if (/计划类别/.test(label)) return ["一般计划", "专项计划"];
    if (/招标项目类型|采购类型/.test(label)) return ["物资类", "工程类", "服务类", "测试类"];
    if (/接口类型/.test(label)) return ["运营类", "检修类", "综合业务", "专项类", "对应类", "月度类"];
    if (/协议类型/.test(label)) return ["框架协议", "单价合同", "订单合同"];
    if (/招标采购方式|采购方式/.test(label)) return ["公开招标", "邀请招标", "竞争性谈判", "询价", "比价", "竞谈"];
    if (/是否为询价类/.test(label)) return ["是", "否"];
    return ["类型A", "类型B", "类型C"];
  }

  function buildFields(keys, mode, rowMap) {
    var fields = [];
    var isEdit = mode === "edit";
    keys.forEach(function (label) {
      var kind = inferKind(label);
      var f = { key: label, label: label, required: true, readonly: false, control: "input", value: "", options: null };
      if (kind === "id") {
        f.readonly = true;
        f.value = isEdit && rowMap[label] != null ? String(rowMap[label]) : genSerialId();
        f.required = false;
      } else if (kind === "datetime") {
        f.control = "datetime-local";
        f.value =
          isEdit && rowMap[label]
            ? normalizeDatetimeLocal(rowMap[label])
            : nowLocalDatetimeValue();
        f.readonly = isEdit;
        f.required = !f.readonly;
      } else if (kind === "user") {
        f.readonly = true;
        f.value = isEdit && rowMap[label] != null ? String(rowMap[label]) : DEMO_USER;
        f.required = false;
      } else if (kind === "yesno") {
        f.control = "select";
        f.options = ["是", "否"];
        f.value = isEdit && rowMap[label] != null ? String(rowMap[label]) : "是";
      } else if (kind === "status") {
        f.control = "select";
        f.options = ["待审核", "待审阅", "已驳回", "已完成", "正常"];
        var sv = isEdit && rowMap[label] != null ? String(rowMap[label]).replace(/\s/g, "") : "待审核";
        if (f.options.indexOf(sv) === -1) f.options = [sv].concat(f.options);
        f.value = sv;
      } else if (kind === "category") {
        f.control = "select";
        f.options = categoryOptions(label);
        var cv = isEdit && rowMap[label] != null ? String(rowMap[label]) : f.options[0];
        if (f.options.indexOf(cv) === -1) f.options = [cv].concat(f.options);
        f.value = cv;
      } else if (kind === "attach") {
        f.control = "text";
        f.value = isEdit && rowMap[label] != null ? String(rowMap[label]) : "—";
        f.readonly = true;
        f.required = false;
      } else {
        f.value = isEdit && rowMap[label] != null ? String(rowMap[label]) : "";
      }
      fields.push(f);
    });
    return fields;
  }

  function normalizeDatetimeLocal(s) {
    var t = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(t)) {
      return t.replace(" ", "T").slice(0, 16);
    }
    return t.slice(0, 16);
  }

  function renderFormFieldsTable(fields) {
    var html = '<table class="demo-spec-form-table"><tbody>';
    fields.forEach(function (f) {
      html += "<tr>";
      html += '<th class="demo-spec-label-cell">';
      if (f.required) html += '<span class="req">*</span>';
      html += escHtml(f.label);
      html += "</th>";
      html += '<td class="demo-spec-input-cell">';
      var name = "f_" + encodeURIComponent(f.key).replace(/%/g, "_");
      if (f.control === "select") {
        html += '<select name="' + name + '" data-key="' + escAttr(f.key) + '"' + (f.readonly ? " disabled" : "") + ">";
        (f.options || []).forEach(function (opt) {
          html +=
            '<option value="' +
            escAttr(opt) +
            '"' +
            (opt === f.value ? " selected" : "") +
            ">" +
            escHtml(opt) +
            "</option>";
        });
        html += "</select>";
      } else if (f.control === "datetime-local") {
        html +=
          '<input type="datetime-local" name="' +
          name +
          '" data-key="' +
          escAttr(f.key) +
          '" value="' +
          escAttr(f.value) +
          '"' +
          (f.readonly ? " readonly" : "") +
          " />";
      } else {
        html +=
          '<input type="text" name="' +
          name +
          '" data-key="' +
          escAttr(f.key) +
          '" value="' +
          escAttr(f.value) +
          '"' +
          (f.readonly ? " readonly" : "") +
          " />";
      }
      html += '<div class="demo-spec-field-err" style="display:none"></div>';
      html += "</td></tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escAttr(s) {
    return escHtml(s).replace(/"/g, "&quot;");
  }

  function collectFormMap(scrollEl) {
    var map = {};
    scrollEl.querySelectorAll("[data-key]").forEach(function (el) {
      var k = el.getAttribute("data-key");
      if (el.tagName === "SELECT" && el.disabled) map[k] = el.options[el.selectedIndex] ? el.options[el.selectedIndex].value : "";
      else map[k] = el.value != null ? el.value : "";
    });
    return map;
  }

  function validateFields(scrollEl, fields) {
    var ok = true;
    fields.forEach(function (f) {
      if (!f.required) return;
      var inp = null;
      scrollEl.querySelectorAll("[data-key]").forEach(function (el) {
        if (el.getAttribute("data-key") === f.key) inp = el;
      });
      var err = inp && inp.parentElement ? inp.parentElement.querySelector(".demo-spec-field-err") : null;
      if (!inp) return;
      var v = (inp.value || "").trim();
      if (!v) {
        ok = false;
        if (err) {
          err.style.display = "block";
          err.textContent = "请填写" + f.label;
        }
      } else if (err) {
        err.style.display = "none";
        err.textContent = "";
      }
    });
    return ok;
  }

  function rowArrayFromMap(map, keys) {
    return keys.map(function (k) {
      return map[k] != null ? map[k] : "";
    });
  }

  function findBusinessIdForDelete(keys, map) {
    var prefer = /(流水|编号|业务|主键|UUID|uuid|编码)/;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (prefer.test(k) && map[k] && String(map[k]).trim()) return String(map[k]).trim();
    }
    for (var j = 0; j < keys.length; j++) {
      if (map[keys[j]] && String(map[keys[j]]).trim()) return String(map[keys[j]]).trim();
    }
    return demoSnowflakeId();
  }

  function toast(msg) {
    var tid = "demoSpecBriefToast";
    var el = document.getElementById(tid);
    if (!el) {
      ensureShell();
      el = document.createElement("div");
      el.id = tid;
      el.setAttribute("role", "status");
      el.style.cssText =
        "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:10080;max-width:min(520px,92vw);padding:10px 18px;border-radius:4px;background:rgba(48,49,51,.88);color:#fff;font-size:14px;line-height:1.45;box-shadow:0 2px 12px rgba(0,0,0,.15);pointer-events:none;transition:opacity .2s ease;";
      document.body.appendChild(el);
    }
    el.textContent = msg || "";
    el.style.opacity = "1";
    if (el._t) clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = "0";
    }, 2400);
  }

  function applyMapToTr(tr, cols, map) {
    if (!tr || !cols || !map) return;
    cols.forEach(function (col, j) {
      if (!col || col === "操作") return;
      var td = tr.children[j];
      if (!td) return;
      var v = map[col] != null ? String(map[col]) : "";
      if (col === "状态" || col === "流程状态") {
        var sp = td.querySelector(".pm-status, .tag-status, .tag-soft, .mt-status, span");
        if (sp) sp.textContent = v;
        else td.textContent = v;
      } else {
        td.textContent = v;
      }
    });
  }

  function appendCloneRowFromMap(tbody, cols, map) {
    if (!tbody || !cols) return false;
    var sample = tbody.querySelector("tr");
    if (!sample) return false;
    var tr = sample.cloneNode(true);
    applyMapToTr(tr, cols, map);
    tbody.appendChild(tr);
    return true;
  }

  function openAddForm(moduleName, cols, onCommit) {
    var keys = keysFromCfgCols(cols);
    var fields = buildFields(keys, "add", {});
    openMask();
    document.getElementById("demoSpecTitle").textContent = "新增" + moduleName;
    var scroll = document.getElementById("demoSpecScroll");
    scroll.innerHTML = renderFormFieldsTable(fields);
    document.getElementById("demoSpecFoot").innerHTML = footButtons("demoSpecCancel", "demoSpecOk");
    document.getElementById("demoSpecCancel").onclick = closeMask;
    document.getElementById("demoSpecOk").onclick = function () {
      if (!validateFields(scroll, fields)) return;
      var map = collectFormMap(scroll);
      onCommit(map);
      closeMask();
      toast("操作成功");
    };
  }

  function openEditForm(moduleName, cols, rowMap, onCommit) {
    var keys = keysFromCfgCols(cols);
    var fields = buildFields(keys, "edit", rowMap);
    openMask();
    document.getElementById("demoSpecTitle").textContent = "修改" + moduleName;
    var scroll = document.getElementById("demoSpecScroll");
    scroll.innerHTML = renderFormFieldsTable(fields);
    document.getElementById("demoSpecFoot").innerHTML = footButtons("demoSpecCancel", "demoSpecOk");
    document.getElementById("demoSpecCancel").onclick = closeMask;
    document.getElementById("demoSpecOk").onclick = function () {
      if (!validateFields(scroll, fields)) return;
      var map = collectFormMap(scroll);
      onCommit(map);
      closeMask();
      toast("操作成功");
    };
  }

  function openDeleteConfirm(cols, rowMap, onCommit) {
    var keys = keysFromCfgCols(cols);
    var bid = findBusinessIdForDelete(keys, rowMap);
    openMask();
    document.getElementById("demoSpecTitle").textContent = "系统提示";
    document.getElementById("demoSpecScroll").innerHTML =
      '<div class="demo-spec-confirm-body">' +
      '<div class="demo-spec-confirm-icon">!</div>' +
      '<p class="demo-spec-confirm-text">是否确认删除业务id为<strong>【' +
      escHtml(bid) +
      "】</strong>的数据项?</p>" +
      "</div>";
    document.getElementById("demoSpecFoot").innerHTML = footButtons("demoSpecCancel", "demoSpecOk");
    document.getElementById("demoSpecCancel").onclick = closeMask;
    document.getElementById("demoSpecOk").onclick = function () {
      onCommit();
      closeMask();
      toast("删除成功");
    };
  }

  function openImportModal(moduleName, onDone) {
    openMask();
    document.getElementById("demoSpecTitle").textContent = "导入";
    document.getElementById("demoSpecScroll").innerHTML =
      '<p class="demo-spec-import-hint">请选择 Excel/CSV 文件（.xlsx / .xls / .csv）。请上传大小不超过 5MB 的文件（演示）。</p>' +
      '<div class="demo-spec-file-row"><label class="demo-spec-label-cell" style="display:block;margin-bottom:8px;text-align:left;background:transparent;border:none;">选择文件</label>' +
      '<input type="file" accept=".xlsx,.xls,.csv" id="demoSpecFile" /></div>';
    document.getElementById("demoSpecFoot").innerHTML = footButtons("demoSpecCancel", "demoSpecOk", "取消", "开始导入");
    document.getElementById("demoSpecCancel").onclick = closeMask;
    document.getElementById("demoSpecOk").onclick = function () {
      closeMask();
      if (typeof onDone === "function") onDone();
      toast("导入成功");
    };
  }

  function runExportDemo(scopeText) {
    var msg = scopeText ? "已按「" + scopeText + "」导出列表（演示）。" : "已开始下载导出文件（演示）。";
    toast(msg);
  }

  function openDetailModal(moduleName, cols, rowMap) {
    var keys = keysFromCfgCols(cols);
    openMask();
    document.getElementById("demoSpecTitle").textContent = "查看" + moduleName;
    var html = '<table class="demo-spec-form-table"><tbody>';
    keys.forEach(function (k) {
      html += "<tr>";
      html += '<th class="demo-spec-label-cell">' + escHtml(k) + "</th>";
      html +=
        '<td class="demo-spec-input-cell">' +
        escHtml(rowMap[k] != null ? rowMap[k] : "—") +
        "</td></tr>";
    });
    html += "</tbody></table>";
    document.getElementById("demoSpecScroll").innerHTML = html;
    document.getElementById("demoSpecFoot").innerHTML =
      '<button type="button" class="demo-spec-btn demo-spec-btn--primary" id="demoSpecCloseOnly">确定</button>';
    document.getElementById("demoSpecCloseOnly").onclick = closeMask;
  }

  /** 流程进度（文档：点流程进度按钮后） */
  function openFlowProgressModal(moduleName) {
    openMask();
    document.getElementById("demoSpecTitle").textContent = "流程进度" + (moduleName ? " · " + moduleName : "");
    document.getElementById("demoSpecScroll").innerHTML =
      '<ul class="demo-spec-flow">' +
      "<li><time>2025-02-26 16:33:54</time><span>发起流程 · 待提交</span></li>" +
      "<li><time>2025-02-26 16:40:12</time><span>部门审核 · 已通过</span></li>" +
      "<li><time>2025-02-27 09:10:00</time><span>采购部复核 · 待审核</span></li>" +
      "</ul>";
    document.getElementById("demoSpecFoot").innerHTML =
      '<button type="button" class="demo-spec-btn demo-spec-btn--primary" id="demoSpecFlowOk">确定</button>';
    document.getElementById("demoSpecFlowOk").onclick = closeMask;
  }

  /** 办理/审批弹窗（长表单占位，与文档「办理按钮弹窗」一致） */
  function openHandleFormModal(moduleName, rowMap) {
    openMask();
    document.getElementById("demoSpecTitle").textContent = "办理 · " + (moduleName || "流程任务");
    var html =
      '<table class="demo-spec-form-table"><tbody>' +
      '<tr><th class="demo-spec-label-cell"><span class="req">*</span>审批意见</th><td class="demo-spec-input-cell"><textarea id="demoSpecApproveTa" placeholder="请输入审批意见"></textarea><div class="demo-spec-field-err" style="display:none"></div></td></tr>' +
      '<tr><th class="demo-spec-label-cell">下一环节</th><td class="demo-spec-input-cell"><select id="demoSpecNext"><option>采购部审核</option><option>结束</option></select></td></tr>' +
      "</tbody></table>";
    document.getElementById("demoSpecScroll").innerHTML = html;
    document.getElementById("demoSpecFoot").innerHTML = footButtons("demoSpecCancel", "demoSpecOk", "取消", "提交");
    document.getElementById("demoSpecCancel").onclick = closeMask;
    document.getElementById("demoSpecOk").onclick = function () {
      var ta = document.getElementById("demoSpecApproveTa");
      if (ta && !String(ta.value || "").trim()) {
        var er = ta.parentElement.querySelector(".demo-spec-field-err");
        if (er) {
          er.style.display = "block";
          er.textContent = "请填写审批意见";
        }
        return;
      }
      closeMask();
      toast("提交成功");
    };
  }

  function collectRowMapFromTr(tr, cols) {
    var map = {};
    cols.forEach(function (col, j) {
      if (!col || col === "操作") return;
      var td = tr.children[j];
      if (!td) return;
      if (col === "状态" || col === "流程状态") {
        var sp = td.querySelector(".pm-status, .tag-status, .mt-status");
        if (!sp) sp = td.querySelector("span");
        map[col] = sp ? sp.textContent.trim() : td.textContent.trim();
      } else if (col === "附件") {
        map[col] = "已上传（演示）";
      } else {
        map[col] = td.textContent.trim();
      }
    });
    return map;
  }

  function getSelectedTr(tbody) {
    var cb = tbody.querySelector("tr input[type=checkbox]:checked");
    return cb ? cb.closest("tr") : null;
  }

  function autoBindTablePage(opts) {
    if (!opts || !opts.hooks) return null;
    var rootEl =
      typeof opts.root === "string"
        ? document.querySelector(opts.root)
        : opts.root;
    if (!rootEl) return null;

    var M = window.DemoListFormModal;
    if (!M) return null;

    var tbodySel = opts.tbody != null ? opts.tbody : "#pmBody";
    var toolbarSel = opts.toolbar !== undefined ? opts.toolbar : "#pmTools";
    var footSel = opts.footSelector != null ? opts.footSelector : ".pm-foot";
    var skipIds = opts.skipButtonIds || ["pmSearchBtn", "pmResetBtn"];
    var uploadImportSuffix =
      opts.uploadImportSuffix !== undefined && opts.uploadImportSuffix !== null
        ? opts.uploadImportSuffix
        : "（附件）";

    var LB = Object.assign(
      {
        add: ["新增"],
        editTb: ["修改"],
        delTb: ["删除"],
        export: ["导出", "全部导出"],
        import: ["导入"],
        detail: ["查看详情", "查看"],
        rowEdit: ["修改"],
        rowDel: ["删除"],
        upload: ["上传"]
      },
      opts.labels || {}
    );

    function inList(txt, arr) {
      var t = (txt || "").trim();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === t) return true;
      }
      return false;
    }

    function resolveModuleName() {
      var mn = opts.moduleName;
      if (typeof mn === "function") return mn() || "列表";
      if (typeof mn === "string" && mn.charAt(0) === "#") {
        var el = document.querySelector(mn);
        return el ? el.textContent.trim() : "列表";
      }
      if (typeof mn === "string" && mn.length) return mn;
      return "列表";
    }

    function resolveCols() {
      var c = opts.cols;
      if (typeof c === "function") return c() || [];
      return c || [];
    }

    function resolveTbody() {
      if (typeof tbodySel === "string") return document.querySelector(tbodySel);
      return tbodySel;
    }

    function indexOfRow(tbody, tr) {
      return Array.prototype.indexOf.call(tbody.children, tr);
    }

    function handler(e) {
      var opEl = e.target.closest("button, a, .mt-action, .pm-op-btn");
      if (!opEl) return;
      if (footSel && opEl.closest(footSel)) return;
      for (var i = 0; i < skipIds.length; i++) {
        if (opEl.id === skipIds[i]) return;
      }

      var cols = resolveCols();
      if (!cols.length) return;
      var moduleName = resolveModuleName();
      var keys = M.keysFromCfgCols(cols);
      var tbody = resolveTbody();
      if (!tbody) return;
      var hooks = opts.hooks;

      if (toolbarSel && opEl.closest(toolbarSel)) {
        var tx = opEl.textContent.trim();
        if (inList(tx, LB.add)) {
          e.preventDefault();
          M.openAddForm(moduleName, cols, function (map) {
            hooks.onAdd(map, keys);
          });
          return;
        }
        if (inList(tx, LB.editTb)) {
          e.preventDefault();
          var trSel = M.getSelectedTr(tbody);
          if (!trSel) {
            M.toast("请先勾选要修改的记录");
            return;
          }
          var mapSel = M.collectRowMapFromTr(trSel, cols);
          M.openEditForm(moduleName, cols, mapSel, function (map) {
            hooks.onEdit(indexOfRow(tbody, trSel), map, keys);
          });
          return;
        }
        if (inList(tx, LB.delTb)) {
          e.preventDefault();
          var trDel = M.getSelectedTr(tbody);
          if (!trDel) {
            M.toast("请先勾选要删除的记录");
            return;
          }
          var mapDel = M.collectRowMapFromTr(trDel, cols);
          M.openDeleteConfirm(cols, mapDel, function () {
            hooks.onDelete(indexOfRow(tbody, trDel));
          });
          return;
        }
        if (inList(tx, LB.export)) {
          e.preventDefault();
          M.runExportDemo(tx === "全部导出" || tx.indexOf("全部") >= 0 ? "全部数据" : "当前列表");
          return;
        }
        if (inList(tx, LB.import)) {
          e.preventDefault();
          M.openImportModal(moduleName, function () {
            if (hooks.onImportDone) hooks.onImportDone();
          });
          return;
        }
      }

      var tr = opEl.closest("tr");
      if (!tr || !tbody.contains(tr)) return;

      var rowMap = M.collectRowMapFromTr(tr, cols);
      var op = opEl.textContent.trim();
      var titleHint = opEl.getAttribute("title") || "";
      var classList = opEl.className || "";

      if (op === "办理") {
        e.preventDefault();
        M.openHandleFormModal(moduleName, rowMap);
        return;
      }

      if (inList(op, LB.detail) || /查看详情|查看/.test(op)) {
        e.preventDefault();
        M.openDetailModal(moduleName, cols, rowMap);
        return;
      }
      if (inList(op, LB.rowEdit) || titleHint === "编辑" || /fa-pen-to-square/.test(classList)) {
        e.preventDefault();
        M.openEditForm(moduleName, cols, rowMap, function (map) {
          hooks.onEdit(indexOfRow(tbody, tr), map, keys);
        });
        return;
      }
      if (inList(op, LB.rowDel) || titleHint === "删除" || /fa-trash-can/.test(classList)) {
        e.preventDefault();
        M.openDeleteConfirm(cols, rowMap, function () {
          hooks.onDelete(indexOfRow(tbody, tr));
        });
        return;
      }
      if (inList(op, LB.upload)) {
        e.preventDefault();
        M.openImportModal(moduleName + uploadImportSuffix, function () {
          if (hooks.onImportDone) hooks.onImportDone();
        });
        return;
      }
    }

    rootEl.addEventListener("click", handler);
    return {
      destroy: function () {
        rootEl.removeEventListener("click", handler);
      }
    };
  }

  window.DemoListFormModal = {
    keysFromCfgCols: keysFromCfgCols,
    collectRowMapFromTr: collectRowMapFromTr,
    applyMapToTr: applyMapToTr,
    appendCloneRowFromMap: appendCloneRowFromMap,
    getSelectedTr: getSelectedTr,
    openAddForm: openAddForm,
    openEditForm: openEditForm,
    openDeleteConfirm: openDeleteConfirm,
    openImportModal: openImportModal,
    runExportDemo: runExportDemo,
    openDetailModal: openDetailModal,
    openFlowProgressModal: openFlowProgressModal,
    openHandleFormModal: openHandleFormModal,
    rowArrayFromMap: rowArrayFromMap,
    close: closeMask,
    toast: toast,
    autoBindTablePage: autoBindTablePage
  };
})();
