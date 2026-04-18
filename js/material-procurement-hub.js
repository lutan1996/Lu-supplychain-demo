/**
 * 物资采购聚合页：.js-op + data-op → 演示弹窗（静态表单/只读详情）
 */
(function () {
  var mask = null;
  var titleEl = null;
  var bodyEl = null;
  var footEl = null;

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg) {
    var id = "procDemoToast";
    var el = $(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.setAttribute(
        "style",
        "position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:1300;background:rgba(0,0,0,.75);color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;max-width:90%;pointer-events:none;opacity:0;transition:opacity .2s;"
      );
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = "0";
    }, 2200);
  }

  function ensureRefs() {
    mask = $("procModalMask");
    titleEl = $("procModalTitle");
    bodyEl = $("procModalBody");
    footEl = $("procModalFoot");
    return !!(mask && titleEl && bodyEl && footEl);
  }

  function setFoot(html) {
    footEl.innerHTML = html || '<button type="button" class="proc-btn" id="procModalClose">关闭</button>';
    var closeBtn = $("procModalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeProcModal, { once: true });
    var x = $("procModalX");
    if (x) x.onclick = closeProcModal;
  }

  function openProcModal(title, bodyHtml, footHtml) {
    if (!ensureRefs()) return;
    titleEl.textContent = title || "提示";
    bodyEl.innerHTML = bodyHtml || "";
    mask.classList.add("is-open");
    mask.setAttribute("aria-hidden", "false");
    setFoot(footHtml);
    mask.onclick = function (ev) {
      if (ev.target === mask) closeProcModal();
    };
  }

  function closeProcModal() {
    if (!ensureRefs()) return;
    mask.classList.remove("is-open");
    mask.setAttribute("aria-hidden", "true");
    mask.onclick = null;
    var box = mask.querySelector(".proc-modal-box");
    if (box) box.classList.remove("fullscreen");
    bodyEl.innerHTML = "";
  }

  function footTriple(cancelOnly) {
    return (
      '<button type="button" class="proc-btn" id="procModalCancel">取消</button>' +
      (cancelOnly
        ? ""
        : '<button type="button" class="proc-btn proc-btn-ghost" id="procSaveDraft">保存草稿</button>' +
          '<button type="button" class="proc-btn proc-btn-primary" id="procSubmitFlow">提交审批</button>')
    );
  }

  function footDoubleSave() {
    return (
      '<button type="button" class="proc-btn" id="procModalCancel">取消</button>' +
      '<button type="button" class="proc-btn proc-btn-primary" id="procSaveOnly">保存</button>'
    );
  }

  function bindFootActions(extra) {
    var c = $("procModalCancel");
    if (c) c.addEventListener("click", closeProcModal);
    var sd = $("procSaveDraft");
    if (sd)
      sd.addEventListener("click", function () {
        toast("已保存草稿（演示）");
        closeProcModal();
      });
    var sb = $("procSubmitFlow");
    if (sb)
      sb.addEventListener("click", function () {
        toast("已提交审批（演示）");
        closeProcModal();
      });
    var sv = $("procSaveOnly");
    if (sv)
      sv.addEventListener("click", function () {
        toast("已保存（演示）");
        closeProcModal();
      });
    if (typeof extra === "function") extra();
  }

  var DEPT = "供应链管理部";
  /** 采购计划新增/编辑弹窗「编制部门」演示默认值 */
  var PLAN_COMPILE_DEPT = "经营发展中心";

  function qtyInput(val) {
    return (
      '<input type="number" min="1" step="1" value="' +
      val +
      '" class="proc-qty-input" style="width:72px;height:26px;border:1px solid #dbe6f3;border-radius:2px;padding:0 6px;box-sizing:border-box;font-size:12px" />'
    );
  }

  function miniTablePlanLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>预算单价</th><th>预算总价</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>WZ-001</td><td>齿轮箱</td><td>GW-2MW</td><td>" +
        qtyInput("2") +
        "</td><td>台</td><td>43,000</td><td>86,000</td><td><a href=\"#\" class=\"js-op\" data-op=\"删除明细行\">删除</a></td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableApplyLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>预算单价</th><th>预算总价</th><th>用途说明</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>WZ-002</td><td>主轴轴承</td><td>SKF-7320</td><td>" +
        qtyInput("4") +
        "</td><td>套</td><td>30,000</td><td>120,000</td><td>备件更换</td><td><a href=\"#\" class=\"js-op\" data-op=\"删除明细行\">删除</a></td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableSourcingLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格</th><th>数量</th><th>单位</th></tr></thead><tbody>' +
        "<tr><td>WZ-011</td><td>电缆</td><td>YJV-3×120</td><td>500</td><td>米</td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableBidLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th></tr></thead><tbody>' +
        "<tr><td>主轴总成</td><td>定制</td><td>6</td><td>套</td></tr>" +
      "</tbody></table>"
    );
  }

  function htmlPlanForm(edit) {
    return (
      '<div class="field-row"><label>计划名称 <span style="color:#cf1322">*</span></label><input type="text" value="' +
        (edit ? "年度备件采购计划" : "") +
        '" placeholder="请输入计划名称" /></div>' +
      '<div class="field-row"><label>计划年度 <span style="color:#cf1322">*</span></label><select><option>2026</option><option>2025</option><option>2024</option></select></div>' +
      '<div class="field-row"><label>编制部门</label><input type="text" value="' +
        PLAN_COMPILE_DEPT +
        '" readonly style="background:#f5f5f5" /></div>' +
      "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
      miniTablePlanLines() +
      '<div class="field-row" style="margin-top:12px"><label>附件</label><input type="file" /></div>'
    );
  }

  function htmlApplyForm(edit) {
    return (
      '<div class="field-row"><label>申请部门 <span style="color:#cf1322">*</span></label><select><option>' +
        DEPT +
        "</option><option>运维中心</option><option>华北场站</option></select></div>" +
      '<div class="field-row"><label>需求日期 <span style="color:#cf1322">*</span></label><input type="date" value="2026-04-10" /></div>' +
      "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
      miniTableApplyLines() +
      '<div class="field-row" style="margin-top:12px"><label>附件</label><input type="file" /></div>' +
      '<div class="field-row"><label>紧急程度</label><select><option>普通</option><option>紧急</option></select></div>'
    );
  }

  function htmlMaterialPicker() {
    return (
      '<div class="field-row"><label>搜索</label><input type="search" placeholder="物资编码 / 名称" /></div>' +
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>单位</th><th>数量</th><th>参考单价</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>WZ-100</td><td>螺栓套件</td><td>M16×80</td><td>套</td><td>" +
        qtyInput("1") +
        "</td><td>120</td><td><button type=\"button\" class=\"proc-btn proc-btn-primary proc-pick-row\">选择</button></td></tr>" +
        "<tr><td>WZ-101</td><td>冷却液</td><td>乙二醇型</td><td>桶</td><td>" +
        qtyInput("1") +
        "</td><td>680</td><td><button type=\"button\" class=\"proc-btn proc-btn-primary proc-pick-row\">选择</button></td></tr>" +
      "</tbody></table>"
    );
  }

  function htmlOrderDetail(orderId) {
    var M = {
      ORD2026001: {
        pending: true,
        supplier: "远景能源",
        planNo: "PL2026001",
        total: "410,000",
        d1: "2026-03-20",
        d2: "2026-04-20",
        lineRow:
          "<tr><td>风机备件包</td><td>标准</td><td>1</td><td>批</td><td>410,000</td><td>410,000</td></tr>",
        contract: "CGHT-2026-001"
      },
      ORD2026002: {
        pending: false,
        supplier: "金风科技",
        planNo: "PL2026002",
        total: "180,000",
        d1: "2026-03-25",
        d2: "2026-04-25",
        lineRow:
          "<tr><td>备件套装</td><td>定制</td><td>2</td><td>套</td><td>90,000</td><td>180,000</td></tr>",
        contract: "HT-2026-088"
      }
    };
    if (M[orderId]) {
      var x = M[orderId];
      var statusTag = x.pending
        ? '<span class="tag-soft tag-pending">待确认</span>'
        : '<span class="tag-soft tag-blue">已确认</span>';
      var foot =
        '<button type="button" class="proc-btn" id="procModalClose">关闭</button>' +
        (x.pending
          ? '<button type="button" class="proc-btn proc-btn-primary js-op" data-op="订单确认">确认订单</button>'
          : '<a class="proc-btn proc-btn-primary" href="receipt-inbound.html" style="text-decoration:none;display:inline-flex;align-items:center">收货入库</a>');
      return {
        body:
          '<p style="margin:0 0 10px"><strong>订单信息</strong></p>' +
          '<div class="field-row"><label>订单号</label><span>' +
          orderId +
          "</span></div>" +
          '<div class="field-row"><label>采购计划编号</label><span>' +
          x.planNo +
          "</span></div>" +
          '<div class="field-row"><label>供应商</label><span>' +
          x.supplier +
          "</span></div>" +
          '<div class="field-row"><label>下单日期</label><span>' +
          x.d1 +
          "</span></div>" +
          '<div class="field-row"><label>交货日期</label><span>' +
          x.d2 +
          "</span></div>" +
          '<div class="field-row"><label>状态</label><span>' +
          statusTag +
          "</span></div>" +
          "<p style=\"margin:14px 0 8px\"><strong>采购清单</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>单价</th><th>总价</th></tr></thead><tbody>' +
          x.lineRow +
          "</tbody></table>" +
          '<p style="margin:12px 0 0;font-size:12px;color:#516a87">采购部门：' +
          DEPT +
          "　合同编号：" +
          x.contract +
          "　<strong>原值合计（元）：" +
          x.total +
          "</strong></p>",
        foot: foot
      };
    }
    var pending = orderId === "PO-2026-0099";
    var statusTag = pending
      ? '<span class="tag-soft tag-pending">待确认</span>'
      : '<span class="tag-soft tag-blue">已确认</span>';
    var supplier = pending ? "联程供应链" : "远景能源";
    var planNo = pending ? "CGJH-2026-001" : "CGJH-2026-003";
    var total = pending ? "126,000" : "410,000";
    var d1 = pending ? "2026-03-22" : "2026-04-01";
    var d2 = pending ? "2026-04-02" : "2026-04-15";
    var foot =
      '<button type="button" class="proc-btn" id="procModalClose">关闭</button>' +
      (pending
        ? '<button type="button" class="proc-btn proc-btn-primary js-op" data-op="订单确认">确认订单</button>'
        : '<a class="proc-btn proc-btn-primary" href="receipt-inbound.html" style="text-decoration:none;display:inline-flex;align-items:center">收货入库</a>');
    return {
      body:
        '<p style="margin:0 0 10px"><strong>订单信息</strong></p>' +
        '<div class="field-row"><label>订单号</label><span>' +
        orderId +
        "</span></div>" +
        '<div class="field-row"><label>采购计划编号</label><span>' +
        planNo +
        "</span></div>" +
        '<div class="field-row"><label>供应商</label><span>' +
        supplier +
        "</span></div>" +
        '<div class="field-row"><label>下单日期</label><span>' +
        d1 +
        "</span></div>" +
        '<div class="field-row"><label>交货日期</label><span>' +
        d2 +
        "</span></div>" +
        '<div class="field-row"><label>状态</label><span>' +
        statusTag +
        "</span></div>" +
        "<p style=\"margin:14px 0 8px\"><strong>采购清单</strong></p>" +
        '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>单价</th><th>总价</th></tr></thead><tbody>' +
        (pending
          ? "<tr><td>齿轮箱配件</td><td>定制</td><td>2</td><td>套</td><td>63,000</td><td>126,000</td></tr>"
          : "<tr><td>风机备件包</td><td>标准</td><td>1</td><td>批</td><td>410,000</td><td>410,000</td></tr>") +
        "</tbody></table>" +
        '<p style="margin:12px 0 0;font-size:12px;color:#516a87">采购部门：' +
        DEPT +
        "　合同编号：" +
        (pending ? "HT-待签" : "CGHT-2026-001") +
        "　<strong>原值合计（元）：" +
        total +
        "</strong></p>",
      foot: foot
    };
  }

  function htmlOrderDevicePicker() {
    return (
      '<div class="field-row"><label>提报人</label><input type="text" value="当前用户" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>部门</label><input type="text" value="经营发展中心" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>公司</label><select><option>河南能源</option><option>天津能源</option><option>甘肃能源</option></select></div>' +
      '<div class="field-row"><label>场站名称</label><select><option>新安风电场</option><option>滨海场站</option><option>酒泉场站</option></select></div>' +
      '<div class="field-row"><label>提报日期</label><input type="date" value="2026-04-15" /></div>' +
      '<div class="field-row"><label>指定业务部门</label><select><option>经营发展中心</option><option>运维业务一部</option><option>运维业务二部</option></select></div>' +
      '<div class="field-row"><label>确认人</label><select><option>张敏（经营发展中心）</option><option>李哲（运维业务一部）</option><option>周宁（运维业务二部）</option></select></div>' +
      '<p style="margin:12px 0 6px;font-weight:600;color:#1f3551">设备清单筛选</p>' +
      '<div class="field-row"><label>物资类别</label><select><option>全部</option><option>风机整机</option><option>齿轮箱</option><option>变流器</option></select></div>' +
      '<div class="field-row"><label>供应商</label><select><option>全部</option><option>联合动力</option><option>东风</option></select></div>' +
      '<div class="field-row"><label>规格型号</label><input type="text" placeholder="请输入规格型号" /></div>' +
      '<div class="field-row"><label>关键字</label><input type="search" placeholder="货物编号/物资名称" /></div>' +
      '<table class="proc-mini-table"><thead><tr><th></th><th>货物编号</th><th>物资名称</th><th>规格/型号</th><th>可销售数量</th><th>单价</th><th>供应商</th></tr></thead><tbody>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" checked /></td><td>G-2026-001</td><td>齿轮箱总成</td><td>GBX-220</td><td>12</td><td>88500</td><td>东风</td></tr>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" /></td><td>G-2026-002</td><td>变流器模块</td><td>CVT-11</td><td>40</td><td>12500</td><td>联合动力</td></tr>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" checked /></td><td>G-2026-003</td><td>主控柜</td><td>MCC-8</td><td>8</td><td>56000</td><td>联合动力</td></tr>' +
      "</tbody></table>" +
      '<p id="orderPickTip" style="margin:8px 0 0;font-size:12px;color:#516a87">已勾选 2 项设备</p>'
    );
  }

  function buildNextOrderNo() {
    var nodes = document.querySelectorAll("[data-order-row]");
    var max = 6000;
    Array.prototype.forEach.call(nodes, function (n) {
      var id = n.getAttribute("data-order-row") || "";
      var num = Number((id.match(/\d+$/) || [0])[0]);
      if (num > max) max = num;
    });
    return "ORD" + String(max + 1);
  }

  function markOrderConfirmed(orderNo, confirmer) {
    var row = document.querySelector('[data-order-row="' + orderNo + '"]');
    if (!row) return;
    var statusCell = row.querySelector("[data-order-status]");
    var opCell = row.querySelector("[data-order-op]");
    if (statusCell) statusCell.innerHTML = '<span class="tag-soft tag-blue">已确认</span>';
    if (opCell) {
      opCell.innerHTML =
        '<a href="receipt-inbound.html" style="color:#1677ff;font-weight:500;text-decoration:none">收货入库</a>' +
        '<span style="margin-left:8px;color:#8c8c8c;font-size:12px">确认人：' + (confirmer || "未指定") + "</span>";
    }
  }

  var OP = {
    新增计划: function () {
      openProcModal("新增采购计划", htmlPlanForm(false), footTriple(false));
      bindFootActions();
    },
    计划编辑: function () {
      openProcModal("编辑采购计划", htmlPlanForm(true), footTriple(false));
      bindFootActions();
    },
    计划查看详情: function () {
      openProcModal(
        "计划详情",
        '<div class="field-row"><label>计划编号</label><span>CGJH-2026-001</span></div>' +
          '<div class="field-row"><label>计划名称</label><span>年度备件采购计划</span></div>' +
          '<div class="field-row"><label>计划年度</label><span>2026</span></div>' +
          '<div class="field-row"><label>编制部门</label><span>经营发展中心</span></div>' +
          '<div class="field-row"><label>编制人</label><span>张三</span></div>' +
          '<div class="field-row"><label>总金额</label><span>5,200,000 元</span></div>' +
          '<div class="field-row"><label>审批状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>' +
          "<p style=\"margin-top:12px\"><strong>物资明细</strong></p>" +
          miniTablePlanLines().replace(
            /<a href[^>]+>删除<\/a>/,
            '<span style="color:#999">—</span>'
          ),
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    计划删除: function () {
      openProcModal(
        "删除确认",
        '<p>是否确认删除该采购计划？删除后不可恢复（演示）。</p>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procDelOk">确定</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procDelOk").addEventListener("click", function () {
        toast("已删除（演示）");
        closeProcModal();
      });
    },
    计划提交审批: function () {
      toast("已提交审批（演示）");
    },
    计划撤回: function () {
      toast("已撤回（演示）");
    },
    查询计划: function () {
      toast("已按条件查询（演示）");
    },
    新增申请: function () {
      openProcModal("新增采购申请", htmlApplyForm(false), footTriple(false));
      bindFootActions();
    },
    申请编辑: function () {
      openProcModal("编辑采购申请", htmlApplyForm(true), footTriple(false));
      bindFootActions();
    },
    申请查看详情: function () {
      openProcModal(
        "申请详情",
        '<div class="field-row"><label>申请单号</label><span>PA20260321001</span></div>' +
          '<div class="field-row"><label>申请部门</label><span>供应链管理部</span></div>' +
          '<div class="field-row"><label>申请人</label><span>张明</span></div>' +
          '<div class="field-row"><label>审批状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>' +
          "<p style=\"margin-top:12px\"><strong>物资明细</strong></p>" +
          miniTableApplyLines().replace(
            /<a href[^>]+>删除<\/a>/,
            '<span style="color:#999">—</span>'
          ),
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    申请撤回: function () {
      toast("已撤回（演示）");
    },
    申请提交审批: function () {
      toast("已提交审批（演示）");
    },
    查询申请: function () {
      toast("已按条件查询（演示）");
    },
    查询采购订单: function () {
      toast("已按条件查询（演示）");
    },
    生成订单: function () {
      OP["新增订单"]();
    },
    新增订单: function () {
      openProcModal(
        "新增订单（设备清单全屏选择）",
        htmlOrderDevicePicker(),
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procCreateOrder">确认生成订单</button>'
      );
      var box = $("procModalMask").querySelector(".proc-modal-box");
      if (box) box.classList.add("fullscreen");
      bindFootActions(function () {
        var body = $("procModalBody");
        if (body) {
          body.addEventListener("change", function (ev) {
            if (!(ev.target && ev.target.classList && ev.target.classList.contains("proc-order-pick"))) return;
            var c = body.querySelectorAll(".proc-order-pick:checked").length;
            var tip = $("orderPickTip");
            if (tip) tip.textContent = "已勾选 " + c + " 项设备";
          });
        }
        var ok = $("procCreateOrder");
        if (ok) {
          ok.addEventListener("click", function () {
            var c = document.querySelectorAll(".proc-order-pick:checked").length;
            if (!c) {
              toast("请至少勾选一项设备");
              return;
            }
            var company = body.querySelector('select:nth-of-type(1)') ? body.querySelector('select:nth-of-type(1)').value : "河南能源";
            var site = body.querySelector('select:nth-of-type(2)') ? body.querySelector('select:nth-of-type(2)').value : "新安风电场";
            var dept = body.querySelector('select:nth-of-type(3)') ? body.querySelector('select:nth-of-type(3)').value : "经营发展中心";
            var confirmer = body.querySelector('select:nth-of-type(4)') ? body.querySelector('select:nth-of-type(4)').value : "张敏（经营发展中心）";
            var newNo = buildNextOrderNo();
            var tbody = document.querySelector("#proc-m3 tbody");
            if (tbody) {
              var tr = document.createElement("tr");
              tr.setAttribute("data-order-row", newNo);
              tr.innerHTML =
                '<td><a href="#" class="js-op proc-order-no" data-op="订单查看详情" data-order="' + newNo + '">' + newNo + "</a></td>" +
                "<td>" + company + "</td>" +
                "<td>" + site + "</td>" +
                "<td>设备清单共" + c + "项</td>" +
                '<td data-order-dept>' + dept + "</td>" +
                '<td data-order-status><span class="tag-soft tag-pending">待确认</span></td>' +
                '<td class="proc-ops-cell" data-order-op><a href="#" class="js-op" data-op="订单确认" data-order="' + newNo + '" data-confirmer="' + confirmer + '">确认订单</a></td>';
              tbody.insertBefore(tr, tbody.firstChild);
            }
            toast("已生成订单并回填设备清单，可继续推送确认（演示）");
            closeProcModal();
          });
        }
      });
    },
    订单查看详情: function (el) {
      var oid = (el && el.getAttribute("data-order")) || "ORD2026001";
      var d = htmlOrderDetail(oid);
      openProcModal("订单详情", d.body, d.foot);
      var closeBtn = $("procModalClose");
      if (closeBtn) closeBtn.addEventListener("click", closeProcModal, { once: true });
    },
    订单确认: function (el) {
      var orderNo = (el && el.getAttribute("data-order")) || "ORD2026001";
      var defaultConfirmer = (el && el.getAttribute("data-confirmer")) || "张敏（经营发展中心）";
      openProcModal(
        "订单确认推送",
        '<div class="field-row"><label>订单编号</label><span>' + orderNo + "</span></div>" +
          '<div class="field-row"><label>确认人</label><select id="procOrderConfirmer"><option>' + defaultConfirmer + "</option><option>李哲（运维业务一部）</option><option>周宁（运维业务二部）</option></select></div>" +
          '<div class="field-row"><label>推送说明</label><textarea id="procOrderPushMsg" placeholder="请输入推送说明">请尽快确认订单需求并安排后续执行。</textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procConfirmOrderPush">确认并推送</button>'
      );
      var cancel = $("procModalCancel");
      if (cancel) cancel.addEventListener("click", closeProcModal);
      var ok = $("procConfirmOrderPush");
      if (ok) {
        ok.addEventListener("click", function () {
          var conf = $("procOrderConfirmer") ? $("procOrderConfirmer").value : defaultConfirmer;
          markOrderConfirmed(orderNo, conf);
          toast("订单已推送并确认生效（演示）");
          closeProcModal();
        });
      }
    },
    查询寻源: function () {
      toast("已按条件查询（演示）");
    },
    新增寻源: function () {
      openProcModal(
        "新增寻源项目",
        '<div class="field-row"><label>项目名称 <span style="color:#cf1322">*</span></label><input type="text" placeholder="请输入项目名称" /></div>' +
          '<div class="field-row"><label>寻源方式</label><select><option>询价</option><option>招标</option></select></div>' +
          '<div class="field-row"><label>发布日期</label><input type="date" /></div>' +
          '<div class="field-row"><label>截止日期</label><input type="date" /></div>' +
          "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
          miniTableSourcingLines(),
        footDoubleSave()
      );
      bindFootActions();
    },
    寻源查看详情: function () {
      openProcModal(
        "寻源详情",
        '<div class="field-row"><label>寻源编号</label><span>XY-2026-011</span></div>' +
          '<div class="field-row"><label>项目名称</label><span>齿轮箱采购寻源</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-blue">进行中</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    寻源编辑: function () {
      OP["新增寻源"]();
      titleEl.textContent = "编辑寻源项目";
    },
    寻源发布询价: function () {
      openProcModal(
        "发布询价单",
        '<div class="field-row"><label>选择供应商</label><span><label><input type="checkbox" checked /> 远景能源</label>　<label><input type="checkbox" checked /> 联程供应链</label>　<label><input type="checkbox" /> 华通物流</label></span></div>' +
          '<div class="field-row"><label>询价说明</label><textarea placeholder="说明技术要求、交货期等"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procSendRf">发送</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procSendRf").addEventListener("click", function () {
        toast("询价单已发送（演示）");
        closeProcModal();
      });
    },
    寻源查看报价: function () {
      openProcModal(
        "供应商报价",
        '<table class="proc-mini-table"><thead><tr><th>供应商名称</th><th>报价金额</th><th>报价日期</th><th>报价附件</th></tr></thead><tbody>' +
          '<tr><td>远景能源</td><td>428,000 元</td><td>2026-03-18</td><td><a href="#">报价单.pdf</a></td></tr>' +
          '<tr><td>联程供应链</td><td>415,000 元</td><td>2026-03-19</td><td><a href="#">报价单.xlsx</a></td></tr>' +
          "</tbody></table>" +
          '<p style="margin-top:12px"><button type="button" class="proc-btn proc-btn-primary" id="procCompare">比价</button></p>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
      $("procCompare").addEventListener("click", function () {
        toast("已进入比价视图（演示）");
      });
    },
    寻源比价决标: function () {
      openProcModal(
        "比价决标",
        '<div class="field-row"><label>中标供应商</label><select><option>联程供应链</option><option>远景能源</option></select></div>' +
          '<div class="field-row"><label>中标理由</label><textarea placeholder="综合价格、交期、质量评价"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procAward">确认决标</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procAward").addEventListener("click", function () {
        toast("决标已确认（演示）");
        closeProcModal();
      });
    },
    查询供应商: function () {
      toast("已按条件查询（演示）");
    },
    新增供应商: function () {
      openProcModal(
        "新增供应商",
        '<div class="field-row"><label>供应商名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>统一社会信用代码 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>法定代表人</label><input type="text" /></div>' +
          '<div class="field-row"><label>注册资本</label><input type="text" /></div>' +
          '<div class="field-row"><label>注册地址</label><input type="text" /></div>' +
          '<div class="field-row"><label>联系人 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>联系电话 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>经营范围</label><textarea></textarea></div>' +
          '<div class="field-row"><label>资质文件</label><input type="file" multiple /></div>' +
          '<div class="field-row"><label>备注</label><textarea></textarea></div>' +
          '<div class="field-row"><label>合作状态</label><select><option>合作中</option><option>已终止</option></select></div>',
        footDoubleSave()
      );
      bindFootActions();
    },
    供应商查看详情: function () {
      openProcModal(
        "供应商详情",
        '<p><strong>基本信息</strong></p>' +
          '<div class="field-row"><label>供应商编码</label><span>GYS001</span></div>' +
          '<div class="field-row"><label>供应商名称</label><span>华通物流有限公司</span></div>' +
          '<div class="field-row"><label>统一社会信用代码</label><span>91310110MA1G8T9X2P</span></div>' +
          '<div class="field-row"><label>联系人</label><span>刘倩</span></div>' +
          "<p style=\"margin:14px 0 8px\"><strong>资质文件</strong></p><ul style=\"margin:0;padding-left:18px\"><li><a href=\"#\">营业执照.pdf</a></li><li><a href=\"#\">道路运输许可.pdf</a></li></ul>" +
          "<p style=\"margin:14px 0 8px\"><strong>合作历史订单</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>订单号</th><th>金额（元）</th><th>日期</th></tr></thead><tbody>' +
          "<tr><td>PO-2025-088</td><td>320,000</td><td>2025-11-02</td></tr></tbody></table>" +
          "<p style=\"margin:14px 0 8px\"><strong>绩效评价记录</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>评价周期</th><th>得分</th><th>等级</th></tr></thead><tbody>' +
          "<tr><td>2025 Q4</td><td>92</td><td>A</td></tr></tbody></table>",
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    供应商编辑: function () {
      OP["新增供应商"]();
      titleEl.textContent = "编辑供应商";
    },
    供应商禁用: function () {
      toast("已禁用供应商（演示）");
    },
    供应商启用: function () {
      toast("已启用供应商（演示）");
    },
    查询合同: function () {
      toast("已按条件查询（演示）");
    },
    新增合同: function () {
      openProcModal(
        "新增合同",
        '<div class="field-row"><label>合同编号</label><input type="text" placeholder="可留空自动生成" /></div>' +
          '<div class="field-row"><label>合同名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>供应商 <span style="color:#cf1322">*</span></label><select><option>宏达物资有限公司</option><option>远景能源</option><option>华通物流有限公司</option><option>联程供应链</option></select></div>' +
          '<div class="field-row"><label>关联采购订单</label><select><option value="">无</option><option>CG-2026-001</option><option>PO-2026-0099</option></select></div>' +
          '<div class="field-row"><label>合同金额 <span style="color:#cf1322">*</span></label><input type="number" placeholder="元" /></div>' +
          '<div class="field-row"><label>签订日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>生效日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>失效日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>合同附件</label><input type="file" multiple /></div>' +
          '<div class="field-row"><label>主要条款</label><textarea></textarea></div>',
        footDoubleSave()
      );
      bindFootActions();
    },
    合同查看详情: function () {
      openProcModal(
        "合同详情",
        '<div class="field-row"><label>合同编号</label><span>HT-2025-001</span></div>' +
          '<div class="field-row"><label>合同名称</label><span>办公用品年度框架协议</span></div>' +
          '<div class="field-row"><label>供应商</label><span>宏达物资有限公司</span></div>' +
          '<div class="field-row"><label>签订日期</label><span>2025-01-08</span></div>' +
          '<div class="field-row"><label>生效日期</label><span>2025-01-10</span></div>' +
          '<div class="field-row"><label>失效日期</label><span>2025-12-31</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-reject">已过期</span></span></div>' +
          '<div class="field-row"><label>合同金额</label><span>125,000 元</span></div>' +
          "<p style=\"margin:12px 0 8px\"><strong>主要条款</strong></p><p style=\"line-height:1.6;margin:0\">办公用品年度集中采购，价格与供货周期按协议执行。</p>" +
          "<p style=\"margin:12px 0 8px\"><strong>附件</strong></p><ul style=\"margin:0;padding-left:18px\"><li><a href=\"#\">合同正文.pdf</a></li></ul>",
        '<button type="button" class="proc-btn" id="procModalClose">关闭</button>'
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    合同编辑: function () {
      OP["新增合同"]();
      titleEl.textContent = "编辑合同";
    },
    合同删除: function () {
      openProcModal("删除确认", "<p>是否确认删除该合同？（演示）</p>", '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procDelOk">确定</button>');
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procDelOk").addEventListener("click", function () {
        toast("已删除（演示）");
        closeProcModal();
      });
    },
    合同下载附件: function () {
      toast("开始下载附件（演示）");
    },
    查询招标: function () {
      toast("已按条件查询（演示）");
    },
    新增招标项目: function () {
      openProcModal(
        "新增招标项目",
        '<div class="field-row"><label>项目名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>招标方式</label><select><option>公开</option><option>邀请</option></select></div>' +
          '<div class="field-row"><label>预算金额 <span style="color:#cf1322">*</span></label><input type="number" placeholder="元" /></div>' +
          '<div class="field-row"><label>投标截止日期</label><input type="datetime-local" /></div>' +
          '<div class="field-row"><label>开标日期</label><input type="datetime-local" /></div>' +
          '<div class="field-row"><label>招标文件</label><input type="file" /></div>' +
          "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
          miniTableBidLines(),
        footDoubleSave()
      );
      bindFootActions();
    },
    招标查看详情: function () {
      openProcModal(
        "招标项目详情",
        '<div class="field-row"><label>项目编号</label><span>ZB-2026-004</span></div>' +
          '<div class="field-row"><label>项目名称</label><span>风机主轴备件采购</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-blue">进行中</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    招标发布公告: function () {
      openProcModal(
        "发布公告",
        '<div class="field-row"><label>公告标题</label><input type="text" value="ZB-2026-004 公开招标公告" /></div>' +
          '<div class="field-row"><label>公告内容</label><textarea style="min-height:120px">（富文本）项目概况、投标人资格、文件获取方式…</textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPub">发布</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPub").addEventListener("click", function () {
        toast("公告已发布（演示）");
        closeProcModal();
      });
    },
    招标查看投标: function () {
      openProcModal(
        "投标列表",
        '<table class="proc-mini-table"><thead><tr><th>供应商名称</th><th>投标金额</th><th>投标日期</th><th>投标文件</th><th>操作</th></tr></thead><tbody>' +
          '<tr><td>远景能源</td><td>2,750,000</td><td>2026-03-26</td><td><a href="#">标书.zip</a></td><td><button type="button" class="proc-btn proc-btn-ghost">查看详情</button></td></tr>' +
          "</tbody></table>",
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    招标开标记录: function () {
      openProcModal(
        "开标记录",
        '<div class="field-row"><label>开标时间</label><span>2026-04-02 09:30</span></div>' +
          "<p><strong>投标情况汇总</strong></p><p style=\"line-height:1.6\">共 3 家有效投标，最低报价 2,720,000 元。</p>" +
          "<p><strong>中标候选人</strong></p><p>第一候选人：远景能源；第二候选人：联程供应链。</p>",
        '<button type="button" class="proc-btn" id="procModalClose">关闭</button><button type="button" class="proc-btn proc-btn-primary" id="procBidWin">确认中标</button>'
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
      $("procBidWin").addEventListener("click", function () {
        toast("中标已确认（演示）");
        closeProcModal();
      });
    },
    查询采购付款: function () {
      toast("已按条件查询（演示）");
    },
    新增付款申请: function () {
      openProcModal(
        "新增付款申请",
        '<div class="field-row"><label>采购订单</label><select><option>CG-2026-001（已完成收货）</option><option>PO-2026-0099（已完成收货）</option></select></div>' +
          '<div class="field-row"><label>供应商</label><input type="text" value="远景能源" readonly style="background:#f5f5f5" /></div>' +
          '<div class="field-row"><label>应付金额</label><input type="text" value="410,000" readonly style="background:#f5f5f5" /></div>' +
          '<div class="field-row"><label>实付金额</label><input type="number" value="410000" /></div>' +
          '<div class="field-row"><label>付款说明</label><textarea></textarea></div>' +
          '<div class="field-row"><label>发票</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPaySubmit">提交审批</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPaySubmit").addEventListener("click", function () {
        toast("付款申请已提交审批（演示）");
        closeProcModal();
      });
    },
    付款查看详情: function () {
      openProcModal(
        "付款申请详情",
        '<div class="field-row"><label>付款申请号</label><span>FK-CG-2026-002</span></div>' +
          '<div class="field-row"><label>采购订单号</label><span>CG-2026-001</span></div>' +
          '<div class="field-row"><label>申请金额</label><span>410,000 元</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    付款审批: function () {
      openProcModal(
        "审批付款申请",
        '<div class="field-row"><label>付款申请号</label><span>FK-CG-2026-002</span></div>' +
          '<div class="field-row"><label>申请金额</label><span>410,000 元</span></div>' +
          '<div class="field-row"><label>审批意见</label><select id="procApprVer"><option value="pass">通过</option><option value="reject">驳回</option></select></div>' +
          '<div class="field-row"><label>驳回原因</label><textarea id="procRejectReason" placeholder="驳回时必填"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procApprOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procApprOk").addEventListener("click", function () {
        var v = $("procApprVer").value;
        if (v === "reject" && !($("procRejectReason").value || "").trim()) {
          toast("请填写驳回原因");
          return;
        }
        toast(v === "pass" ? "审批通过（演示）" : "已驳回（演示）");
        closeProcModal();
      });
    },
    付款编辑: function () {
      OP["新增付款申请"]();
      titleEl.textContent = "编辑付款申请";
    },
    付款撤回: function () {
      toast("已撤回（演示）");
    },
    付款确认付款: function () {
      openProcModal(
        "确认付款",
        '<div class="field-row"><label>付款金额</label><input type="number" value="50000" /></div>' +
          '<div class="field-row"><label>付款日期</label><input type="date" /></div>' +
          '<div class="field-row"><label>付款凭证</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPayDone">确认付款</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPayDone").addEventListener("click", function () {
        toast("付款已确认（演示）");
        closeProcModal();
      });
    },
    查询退换货: function () {
      toast("已按条件查询（演示）");
    },
    新增退货申请: function () {
      openProcModal(
        "新增退货申请",
        '<div class="field-row"><label>采购订单</label><select><option>PO-2026-0099</option></select></div>' +
          '<div class="field-row"><label>供应商</label><input type="text" value="联程供应链" readonly style="background:#f5f5f5" /></div>' +
          "<p style=\"margin:12px 0 4px\"><strong>物资明细</strong>（勾选退货行并填写数量）</p>" +
          '<table class="proc-mini-table"><thead><tr><th>物资</th><th>可退数量</th><th>退货数量</th></tr></thead><tbody>' +
          "<tr><td>齿轮箱配件</td><td>2</td><td><input type=\"number\" value=\"2\" style=\"width:80px\" /></td></tr></tbody></table>" +
          '<div class="field-row" style="margin-top:10px"><label>退货原因</label><textarea placeholder="质检不合格等"></textarea></div>' +
          '<div class="field-row"><label>附件</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procRetSubmit">提交审批</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procRetSubmit").addEventListener("click", function () {
        toast("退货申请已提交（演示）");
        closeProcModal();
      });
    },
    退货查看详情: function () {
      openProcModal(
        "退货详情",
        '<div class="field-row"><label>退货单号</label><span>TH-2026-001</span></div>' +
          '<div class="field-row"><label>采购订单</label><span>PO-2026-0099</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    退货审批: function () {
      openProcModal(
        "审批退货申请",
        '<div class="field-row"><label>退货单号</label><span>TH-2026-001</span></div>' +
          '<div class="field-row"><label>审批意见</label><select id="procRetVer"><option value="pass">通过</option><option value="reject">驳回</option></select></div>' +
          '<div class="field-row"><label>驳回原因</label><textarea id="procRetReason"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procRetOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procRetOk").addEventListener("click", function () {
        if ($("procRetVer").value === "reject" && !($("procRetReason").value || "").trim()) {
          toast("请填写驳回原因");
          return;
        }
        toast("审批已处理（演示）");
        closeProcModal();
      });
    },
    退货撤回: function () {
      toast("已撤回（演示）");
    },
    查询质量验收: function () {
      toast("已按条件查询（演示）");
    },
    验收查看详情: function () {
      openProcModal(
        "验收详情",
        '<div class="field-row"><label>验收单号</label><span>YS-2026-003</span></div>' +
          '<div class="field-row"><label>采购订单</label><span>PO-2026-0099</span></div>' +
          '<div class="field-row"><label>验收结果</label><span><span class="tag-soft tag-done">合格</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    验收录入: function () {
      openProcModal(
        "录入验收结果",
        '<div class="field-row"><label>采购订单</label><span>PO-2026-0099（只读）</span></div>' +
          '<div class="field-row"><label>实收数量</label><input type="number" value="2" /></div>' +
          '<div class="field-row"><label>合格数量</label><input type="number" value="2" /></div>' +
          '<div class="field-row"><label>不合格数量</label><input type="number" value="0" /></div>' +
          '<div class="field-row"><label>不合格原因</label><textarea></textarea></div>' +
          '<div class="field-row"><label>质检报告</label><input type="file" /></div>' +
          '<div class="field-row"><label>验收结论</label><select><option>合格</option><option>不合格</option></select></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procQcOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procQcOk").addEventListener("click", function () {
        toast("验收结果已保存；不合格时将触发退货流程（演示）");
        closeProcModal();
      });
    },
    重置筛选: function () {
      toast("筛选条件已重置（演示）");
    },
    物资选择: function () {
      openProcModal(
        "选择物资",
        htmlMaterialPicker(),
        '<button type="button" class="proc-btn proc-btn-primary" id="procPickerSubmitFlow">提交审批</button><button type="button" class="proc-btn" id="procModalCancel">取消</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      var subFlow = $("procPickerSubmitFlow");
      if (subFlow) {
        subFlow.addEventListener("click", function () {
          var firstPlanRow = document.querySelector("#proc-m1 tbody tr");
          if (firstPlanRow && firstPlanRow.cells[7]) {
            firstPlanRow.cells[7].innerHTML = '<span class="tag-soft tag-pending">待审批</span>';
          }
          toast("已提交审批，列表状态已更新为待审批（演示）");
          closeProcModal();
        });
      }
      bodyEl.querySelectorAll(".proc-pick-row").forEach(function (btn) {
        btn.addEventListener("click", function () {
          toast("已加入物资明细（演示）");
          closeProcModal();
        });
      });
    },
    删除明细行: function () {
      toast("已删除该行（演示）");
    }
  };

  function init() {
    if (!ensureRefs()) return;
    var x = $("procModalX");
    if (x) x.addEventListener("click", closeProcModal);

    document.addEventListener(
      "click",
      function (e) {
        if (!document.getElementById("procModalMask")) return;
        var t = e.target.closest(".js-op");
        if (!t) return;
        var op = t.getAttribute("data-op");
        if (!op || !OP[op]) return;
        var href = t.getAttribute("href");
        if (t.tagName === "BUTTON" || (t.tagName === "A" && (!href || href === "#"))) e.preventDefault();
        OP[op](t);
      },
      true
    );
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
