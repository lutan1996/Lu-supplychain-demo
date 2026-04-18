(function () {
      var scene = "";
      var sceneByLabel = {
        "非招标采委会资料审批": "nonbid",
        "采购计划审批单": "plan",
        "长协采购结果使用审批单": "longtermResult",
        "重新采购审批单": "repurchase",
        "本部采购文件审查纪要": "minutes",
        "招标采委会资料审批": "bid",
        "终止采购审批单": "terminate",
        "公司级集采计划审批单": "groupPlan",
        "15万以下采购结果审定(项目单位)": "under15",
        "本部月度招标采购计划申报": "monthlyBid",
        "本部月度非招标采购计划申报": "monthlyNonbid",
        "采购项目审定结果通知(非招标)": "noticeNonbid",
        "基础数据维护": "dataMaintain",
        "归档目录": "archive",
        "长协领用管理": "longtermUse"
      };
      var titleByScene = {
        nonbid: "非招标采委会资料审批",
        plan: "采购计划审批单",
        longtermResult: "长协采购结果使用审批单",
        repurchase: "重新采购审批单",
        minutes: "本部采购文件审查纪要",
        bid: "招标采委会资料审批",
        terminate: "终止采购审批单",
        groupPlan: "公司级集采计划审批单",
        under15: "15万以下采购结果审定(项目单位)",
        monthlyBid: "本部月度招标采购计划申报",
        monthlyNonbid: "本部月度非招标采购计划申报",
        noticeNonbid: "采购项目审定结果通知(非招标)",
        dataMaintain: "基础数据维护",
        archive: "归档目录",
        longtermUse: "长协领用管理"
      };
      var fixedScene = "";
      try {
        fixedScene = (document.documentElement.getAttribute("data-pm-scene") || "").trim();
      } catch (eFix) {}

      if (!fixedScene) {
        try {
          var sp = new URLSearchParams(window.location.search || "");
          var byScene = (sp.get("scene") || "").trim();
          var byLabel = (sp.get("pageSub") || "").trim();
          var byStore = "";
          try { byStore = (sessionStorage.getItem("demoPurchaseScene") || "").trim(); } catch (es) {}
          if (byScene) scene = byScene;
          else if (byStore) scene = byStore;
          else if (byLabel && sceneByLabel[byLabel]) scene = sceneByLabel[byLabel];
          else {
            try {
              var nsp = new URLSearchParams(String(window.name || ""));
              var byNameScene = (nsp.get("scene") || "").trim();
              var byNameLabel = (nsp.get("pageSub") || "").trim();
              if (byNameScene) scene = byNameScene;
              else if (byNameLabel && sceneByLabel[byNameLabel]) scene = sceneByLabel[byNameLabel];
            } catch (en) {}
          }
        } catch (e) {}
      } else {
        scene = fixedScene;
      }
      var SCENES = {
        nonbid: {
          filters: ["项目名称", "申请人", "申请单位名称"],
          cols: [
            "",
            "项目名称",
            "申请人",
            "申请时间",
            "联系电话",
            "采购编号",
            "申请单位名称",
            "报价单位",
            "推荐成交价",
            "状态",
            "操作"
          ],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            [
              "2025年风机备件集中采购（非招标）",
              "张明",
              "2024-11-13 16:29",
              "13800001001",
              "CG-FBZB-2024-0156",
              "华北龙源风电有限公司",
              "远景能源有限公司",
              "1,256,800.00",
              "待审核"
            ],
            [
              "塔筒防腐工程服务采购",
              "李华",
              "2024-11-15 15:21",
              "13800001002",
              "CG-FBZB-2024-0162",
              "华东龙源新能源有限公司",
              "中材科技股份有限公司",
              "3,890,000.00",
              "待审核"
            ],
            [
              "齿轮箱年度维保（非招标）",
              "王强",
              "2024-11-19 11:16",
              "13800001003",
              "CG-FBZB-2024-0178",
              "蒙东龙源风力发电有限公司",
              "南京高速齿轮制造有限公司",
              "568,200.00",
              "待审阅"
            ],
            [
              "箱变及附属设备采购",
              "赵敏",
              "2024-12-03 09:16",
              "13800001004",
              "CG-FBZB-2024-0201",
              "西北龙源电力有限公司",
              "特变电工股份有限公司",
              "2,150,000.00",
              "待审核"
            ],
            [
              "电缆及附件批次采购",
              "钱磊",
              "2024-12-08 14:30",
              "13800001005",
              "CG-FBZB-2024-0210",
              "天津龙源风力发电有限公司",
              "宝胜科技创新股份有限公司",
              "986,500.00",
              "已驳回"
            ],
            [
              "叶片运输及吊装服务",
              "孙涛",
              "2024-12-09 09:45",
              "13800001006",
              "CG-FBZB-2024-0218",
              "华中龙源电力有限公司",
              "中远海运物流有限公司",
              "1,120,000.00",
              "待审核"
            ],
            [
              "化验室耗材采购",
              "周敏",
              "2024-12-10 11:20",
              "13800001007",
              "CG-FBZB-2024-0220",
              "检修中心",
              "国药试剂",
              "42,000.00",
              "待审批"
            ],
            [
              "车辆年度维保",
              "马超",
              "2024-12-11 08:00",
              "13800001008",
              "CG-FBZB-2024-0222",
              "天津龙源",
              "本地汽修",
              "86,000.00",
              "作废"
            ],
            [
              "小型技改施工",
              "丁悦",
              "2024-12-12 14:30",
              "13800001009",
              "CG-FBZB-2024-0225",
              "土默特公司",
              "施工单位A",
              "210,000.00",
              "待归档"
            ]
          ]
        },
        plan: {
          filters: ["流水编号", "提报单位", "项目名称"],
          cols: [
            "",
            "流水编号",
            "提报时间",
            "联系方式",
            "提报单位",
            "项目名称",
            "计划类型",
            "项目类别",
            "预算限价(万元)",
            "是否有最高限价",
            "是否与范本一致",
            "非招标>5000万",
            "半年内已终止项目",
            "是否多标段",
            "是否限中",
            "状态",
            "操作"
          ],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            [
              "LSH-CQJH-2024-0156",
              "2024-11-13 16:29:32",
              "010-88881234",
              "华北龙源风电有限公司",
              "采购计划审批单测试123",
              "集中采购",
              "物资类",
              "2500",
              "是",
              "是",
              "是",
              "否",
              "否",
              "否",
              "待审核"
            ],
            [
              "LSH-CQJH-2024-0162",
              "2024-11-15 15:21:03",
              "021-66672345",
              "华东龙源新能源有限公司",
              "齿轮箱年度维保计划",
              "专项计划",
              "服务类",
              "568",
              "是",
              "是",
              "否",
              "否",
              "否",
              "否",
              "待审批"
            ],
            [
              "LSH-CQJH-2024-0178",
              "2024-11-19 11:16:31",
              "0471-7778899",
              "蒙东龙源风力发电有限公司",
              "检修材料集中采购",
              "批次计划",
              "物资类",
              "1200",
              "否",
              "是",
              "是",
              "否",
              "是",
              "否",
              "已完成"
            ],
            [
              "LSH-CQJH-2024-0201",
              "2024-12-03 09:16:33",
              "13800001004",
              "西北龙源电力有限公司",
              "箱变及附属设备采购计划",
              "单项计划",
              "物资类",
              "2150",
              "是",
              "否",
              "是",
              "否",
              "否",
              "是",
              "草稿"
            ],
            [
              "LSH-CQJH-2024-0210",
              "2024-12-03 10:52:48",
              "022-88889900",
              "天津龙源风力发电有限公司",
              "电缆及附件批次计划",
              "集中采购",
              "物资类",
              "986.5",
              "是",
              "是",
              "否",
              "否",
              "否",
              "否",
              "已驳回"
            ],
            [
              "LSH-CQJH-2024-0217",
              "2024-12-03 11:00:08",
              "010-66660001",
              "华北龙源",
              "备件集中采购计划A",
              "批次计划",
              "物资类",
              "3200",
              "是",
              "是",
              "否",
              "否",
              "否",
              "否",
              "待审核"
            ],
            [
              "LSH-CQJH-2024-0218",
              "2024-12-08 00:00:00",
              "027-88881122",
              "华中龙源电力有限公司",
              "叶片运输及吊装服务计划",
              "服务类计划",
              "服务类",
              "1120",
              "否",
              "是",
              "否",
              "是",
              "否",
              "否",
              "待审批"
            ],
            [
              "LSH-CQJH-2024-0220",
              "2024-12-03 11:08:16",
              "010-77770001",
              "蒙东龙源",
              "润滑油批次计划",
              "集中采购",
              "物资类",
              "88",
              "否",
              "是",
              "否",
              "否",
              "否",
              "否",
              "待审核"
            ],
            [
              "LSH-CQJH-2024-0221",
              "2024-12-03 11:13:11",
              "010-77770002",
              "华东龙源",
              "消防器材更换",
              "专项计划",
              "物资类",
              "42",
              "是",
              "是",
              "否",
              "否",
              "否",
              "否",
              "草稿"
            ],
            [
              "LSH-CQJH-2024-0222",
              "2024-12-03 11:20:00",
              "010-77770003",
              "龙源电力本部",
              "年度钢材集采计划",
              "公司级",
              "物资类",
              "5600",
              "是",
              "是",
              "是",
              "否",
              "是",
              "否",
              "待审核"
            ],
            [
              "LSH-CQJH-2024-0223",
              "2024-12-04 09:00:00",
              "010-77770004",
              "西北龙源",
              "检修外包服务",
              "服务类计划",
              "服务类",
              "320",
              "否",
              "是",
              "否",
              "是",
              "否",
              "否",
              "已完成"
            ],
            [
              "LSH-CQJH-2024-0224",
              "2024-12-05 10:15:22",
              "010-77770005",
              "天津龙源",
              "化验设备采购",
              "单项计划",
              "物资类",
              "65",
              "是",
              "否",
              "否",
              "否",
              "否",
              "否",
              "待审批"
            ]
          ]
        },
        longtermResult: {
          filters: ["长协编号", "项目名称", "日期", "项目公司"],
          cols: [
            "",
            "长协编号",
            "项目名称",
            "采购编号",
            "办理人",
            "办理电话",
            "首选供应商",
            "日期",
            "有效期",
            "采购类别",
            "区域公司",
            "项目公司",
            "使用部门",
            "状态",
            "操作"
          ],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["CX-2024-001", "风机备件长协", "CG-2024-1001", "张明", "13800001101", "远景能源", "2024-11-28 00:00:00", "2026-11-28 00:00:00", "物资类", "华北", "内蒙古龙源蒙东新能源有限公司", "计划物资部", "待审批"],
            ["CX-2024-002", "齿轮箱年度维保", "CG-2024-1002", "李华", "13800001102", "南高齿", "2024-11-28 10:20:00", "2026-11-28 10:20:00", "服务类", "华东", "华东龙源新能源有限公司", "检修部", "待审核"],
            ["CX-2024-003", "叶片及螺栓长协", "CG-2024-1003", "王强", "13800001103", "中材科技", "2024-11-29 08:00:00", "2026-11-29 08:00:00", "物资类", "蒙东", "蒙东龙源风力发电有限公司", "物资部", "已完成"],
            ["CX-2024-004", "箱变及环网柜", "CG-2024-1004", "赵敏", "13800001104", "特变电工", "2024-12-01 00:00:00", "2026-12-01 00:00:00", "物资类", "西北", "西北龙源电力有限公司", "工程部", "草稿"],
            ["CX-2024-005", "电缆及附件", "CG-2024-1005", "钱磊", "13800001105", "宝胜股份", "2024-12-02 14:30:00", "2026-12-02 14:30:00", "物资类", "天津", "天津龙源风力发电有限公司", "采购部", "待审批"],
            ["CX-2024-006", "润滑油集中采购", "CG-2024-1006", "孙涛", "13800001106", "壳牌中国", "2024-12-03 09:16:00", "2026-12-03 09:16:00", "物资类", "华中", "华中龙源电力有限公司", "仓储中心", "待审核"]
          ]
        },
        repurchase: {
          filters: ["项目名称", "项目单位"],
          cols: ["", "项目名称", "项目单位", "项目预算", "采购方式", "任务时间", "开标时间", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["华北区域备件集中采购", "华北龙源风电有限公司", "1280", "公开招标", "2024-12-01 00:00:00", "2024-12-15 09:30:00", "待发布"],
            ["齿轮箱维修服务", "土默特公司", "360", "邀请招标", "2024-12-03 00:00:00", "2024-12-18 14:00:00", "待审核"],
            ["箱变技改项目", "华东龙源", "2150", "公开招标", "2024-12-05 00:00:00", "2024-12-20 10:00:00", "已完成"],
            ["电缆批次询价", "蒙东龙源", "986", "竞争性谈判", "2024-12-06 00:00:00", "2024-12-22 16:00:00", "已撤回"],
            ["润滑油框架", "天津龙源", "120", "询价", "2024-12-08 00:00:00", "2024-12-25 11:00:00", "待审批"],
            ["检修工具采购", "西北龙源", "88", "单一来源", "2024-12-09 00:00:00", "2024-12-26 09:00:00", "草稿"],
            ["叶片吊装服务", "华中龙源", "560", "公开招标", "2024-12-10 00:00:00", "2024-12-28 15:00:00", "待审核"],
            ["消防器材更换", "张北风电场", "42", "询价", "2024-12-11 00:00:00", "2024-12-29 08:00:00", "已完成"],
            ["化验室耗材", "检修中心", "15", "比价", "2024-12-12 00:00:00", "2024-12-30 13:00:00", "待审核"]
          ]
        },
        minutes: {
          filters: ["采购部门", "日期", "办理人", "项目名称"],
          cols: [
            "",
            "日期",
            "采购部门",
            "办理人",
            "项目名称",
            "联系电话",
            "标段名称",
            "标段编号",
            "审定会议时间",
            "采购范围",
            "资质业绩条件",
            "评分办法",
            "经办人",
            "状态",
            "操作"
          ],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["2024-11-14 00:00:00", "采购管理部", "刘洋", "风机备件采购文件审查", "13220076543", "标段一", "BD-2024-01", "2024-11-20 14:00:00", "主机备件", "具备同类业绩≥3项", "综合评分法", "1001", "待审批"],
            ["2024-11-15 00:00:00", "法务审计部", "周敏", "工程类招标文件条款", "13220076544", "标段二", "BD-2024-02", "2024-11-22 10:00:00", "土建工程", "一级资质", "最低价法", "1002", "待审核"],
            ["2024-11-18 00:00:00", "采购管理部", "刘洋", "长协范本修订", "13220076545", "标段一", "BD-2024-03", "2024-11-25 16:00:00", "长协物资", "无限制", "综合评分法", "1003", "已完成"],
            ["2024-11-20 00:00:00", "技术中心", "吴刚", "检修项目文件", "13220076546", "标段三", "BD-2024-04", "2024-11-28 09:30:00", "检修服务", "具备承修资质", "综合评分法", "1004", "已审批"],
            ["2024-11-22 00:00:00", "采购管理部", "刘洋", "非招标通用条款", "13220076547", "标段一", "BD-2024-05", "2024-12-01 11:00:00", "通用物资", "符合名录", "经评审的最低价", "1005", "待审批"],
            ["2024-11-25 00:00:00", "计划物资部", "郑芳", "电缆技术规范", "13220076548", "标段二", "BD-2024-06", "2024-12-03 15:00:00", "电缆类", "型式试验报告", "综合评分法", "1006", "待审核"],
            ["2024-11-28 00:00:00", "采购管理部", "刘洋", "箱变招标文件", "13220076549", "标段一", "BD-2024-07", "2024-12-05 10:00:00", "电气设备", "CCC认证", "综合评分法", "1007", "待审批"]
          ]
        },
        bid: {
          filters: ["申报日期", "项目名称", "申报单位"],
          cols: ["", "申报日期", "项目名称", "申报单位", "联系人", "联系电话", "是否含异地项目", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["2024-11-22", "2025年风机主机招标（第一批）", "华北龙源", "张明", "010-88881234", "否", "待审核"],
            ["2024-12-03", "塔筒及法兰采购", "华东龙源", "李华", "021-66672345", "否", "已驳回"],
            ["2024-12-03", "箱变及预制舱采购", "蒙东龙源", "王强", "0471-7778899", "是", "待审阅"],
            ["2024-12-06", "叶片运输及保险服务", "西北龙源", "赵敏", "029-88889900", "否", "待审核"],
            ["2024-12-09", "齿轮箱检修服务招标", "华中龙源", "钱磊", "027-88881122", "否", "待审核"],
            ["2024-12-10", "润滑油框架采购", "天津龙源", "郑芳", "022-88881200", "否", "待审批"],
            ["2024-12-11", "消防器材更换", "张北风电场", "杨洋", "031-66660011", "否", "已完成"]
          ]
        },
        terminate: {
          filters: ["项目名称", "项目单位", "项目编号"],
          opKind: "iconsEditDelete",
          cols: ["", "项目名称", "项目单位", "项目编号", "项目预算", "采购方式", "挂网时间", "开标/截标时间", "终止原因说明", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["张北二期风机采购", "张北龙源风电有限公司", "ZB-2024-201", "18500", "公开招标", "2024-10-01 00:00:00", "2024-11-30 18:00:00", "核准文件调整，暂缓实施", "待审批"],
            ["塔筒防腐工程", "华东龙源", "ZB-2024-099", "3200", "邀请招标", "2024-11-05 00:00:00", "2024-12-03 16:00:00", "投资计划压缩", "草稿"],
            ["齿轮箱备件", "蒙东龙源", "CG-2024-160", "860", "竞争性谈判", "2024-11-10 00:00:00", "2024-12-03 17:00:00", "技术路线变更", "已完成"],
            ["箱变采购批次", "西北龙源", "ZB-2024-102", "4200", "公开招标", "2024-11-12 00:00:00", "2024-12-04 08:00:00", "并网推迟", "待审核"]
          ]
        },
        groupPlan: {
          filters: ["提报人", "提报时间", "提报单位", "项目名称"],
          cols: ["", "提报人", "提报时间", "提报单位", "项目名称", "计划类型", "项目类别", "标的类别", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["88888", "2024-11-11 09:00:00", "2134", "公司级集采计划审批单", "集中框架", "物资类", "设备", "待提报"],
            ["板", "2024-11-19 16:57:22", "22", "华北区域钢材集采", "区域集采", "物资类", "钢材", "待审核"],
            ["1", "2024-12-03 10:54:18", "1", "华东检修耗材集采", "专项计划", "服务类", "耗材", "已通过"],
            ["林峰", "2024-12-04 09:38:11", "龙源本部", "2025电气设备集采", "公司级", "物资类", "电气", "待审核"]
          ]
        },
        under15: {
          filters: ["项目名称", "采购人", "采购编号", "日期"],
          cols: ["", "项目名称", "采购人", "采购编号", "联系电话", "办理人", "采购情况", "日期", "报价单位", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["采购结果审定表(项目单位)15万测试", "2", "2", "13220076543", "甘", "小额采购", "2024-11-19 17:12:23", "1", "待审核"],
            ["测试项目", "甘", "1223122", "13800001002", "测试人", "零星采购", "2024-11-20 09:30:00", "2", "已通过"],
            ["测试11", "测试人", "122211", "13900001111", "刘强", "办公用品", "2024-11-21 14:00:00", "3", "待审批"],
            ["场站消防器材", "杨洋", "SD-WY-01", "13100002222", "陈静", "消防更换", "2024-11-22 10:00:00", "1", "待审核"],
            ["化验室耗材", "黄磊", "SD-WY-02", "13300003333", "周敏", "试剂采购", "2024-11-23 16:20:00", "2", "待审核"],
            ["车辆维保", "周敏", "SD-WY-03", "13400004444", "马超", "年度保养", "2024-11-24 11:11:00", "1", "已完成"]
          ]
        },
        monthlyBid: {
          filters: ["日期", "申报部门", "项目名称", "标的类别"],
          cols: ["", "是否紧急项目", "日期", "申报部门", "申报人", "项目名称", "联系电话", "项目类别", "采购范围", "采购预算", "标的类别", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["否", "2024-11-14 00:00:00", "物资部", "王五", "公司本部月度招标采购计划审批测试", "010-88881234", "物资类", "备件集采", "1280", "设备", "待审批"],
            ["否", "2024-11-15 00:00:00", "工程部", "赵六", "1111", "021-66672345", "工程类", "道路修缮", "860", "工程", "已完成"],
            ["是", "2024-11-18 00:00:00", "物资部", "钱七", "齿轮箱月度计划", "13800001003", "物资类", "主机部件", "210", "设备", "待审核"],
            ["否", "2024-11-20 00:00:00", "安质部", "孙八", "定检服务", "13900001004", "服务类", "全年框架", "320", "服务", "待审批"]
          ]
        },
        monthlyNonbid: {
          filters: ["日期", "申报部门", "申报人", "项目名称", "项目类别"],
          cols: ["", "是否为项目类", "日期", "申报部门", "申报人", "项目名称", "项目类别", "采购方式", "标包类别", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["是", "2024-11-14 00:00:00", "物资部", "王五", "本部月度非招标计划A", "物资类", "公开询价", "物资", "待审批"],
            ["否", "2024-11-15 00:00:00", "检修部", "赵六", "检修外包", "服务类", "竞争性谈判", "服务", "已驳回"],
            ["是", "2024-11-18 00:00:00", "计划部", "钱七", "技改小额", "工程类", "邀请询价", "工程", "已通过"],
            ["是", "2024-11-20 00:00:00", "物资部", "孙八", "备件紧急补货", "物资类", "单一来源", "物资", "待审核"]
          ]
        },
        noticeNonbid: {
          filters: ["日期", "定标会"],
          cols: ["", "日期", "定标会", "定标结果通知", "采购部审核", "采购部签发", "分表", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["2024-11-21 09:01:01", "2", "2", "2", "2", "2", "待审批"],
            ["2024-11-22 10:10:10", "测试11", "11", "11", "11", "11", "已拒绝"],
            ["2024-11-23 08:00:00", "龙源电力项目定标结果通知（非招标）会123", "1864610606430138369", "22", "22", "22", "已完成"],
            ["2024-11-24 12:00:00", "怀仁专项", "1864610606430138370", "1", "1", "1", "草稿"],
            ["2024-11-25 15:30:00", "商丘专项", "1864610606430138371", "3", "3", "3", "待审批"],
            ["2024-11-26 09:20:00", "华东区域", "1864610606430138372", "5", "5", "5", "待审核"]
          ]
        },
        dataMaintain: {
          filters: ["物料编码", "物料名称", "供应商"],
          cols: ["", "物料编码", "物料名称", "规格型号", "计量单位", "参考供应商", "生效日期", "累计引用次数", "状态", "操作"],
          toolButtons: ["add", "edit", "delete", "export", "import"],
          rows: [
            ["WL-FJ-001", "风机主轴轴承", "SKF 240/500", "套", "斯凯孚（中国）", "2024-01-01", "156", "待审核"],
            ["WL-FJ-002", "齿轮箱润滑油", "VG 220 合成型", "升", "壳牌（中国）", "2024-03-15", "89", "待审阅"],
            ["WL-DL-010", "35kV 电力电缆", "YJV22 3×95", "米", "宝胜科技创新", "2024-06-01", "412", "待审核"],
            ["WL-XB-003", "美式箱变本体", "YB27-12/0.4", "台", "特变电工", "2024-08-20", "67", "待审核"],
            ["WL-YB-007", "叶片螺栓", "M36 高强度", "套", "中车紧固件", "2024-09-10", "234", "待审核"],
            ["WL-BH-012", "防火涂料", "水性型", "桶", "佐敦涂料", "2024-10-01", "45", "草稿"]
          ]
        },
        archive: {
          filters: [
            "目录名称",
            {
              type: "select",
              label: "表单类型",
              options: ["请选择表单类型", "计划类", "审批单类", "通知类", "纪要类", "目录类"]
            }
          ],
          cols: ["", "目录名称", "操作"],
          opKind: "iconView",
          toolButtons: ["add", "edit", "delete", "export"],
          rows: [
            ["> 计划结果委资料审批"],
            ["采购计划审批单"],
            ["长协采购结果使用审批单"],
            ["公司本部月度非招标采购计划申报表"],
            ["公司本部月度招标采购计划申报表"],
            ["采购项目审定结果通知 (非招标)"],
            ["招标采委会资料审批"],
            ["15万以下采购结果审定(项目单位)"],
            ["重新采购审批单"],
            ["本部采购文件审查纪要"],
            ["> 终止采购审批单"],
            ["> 公司级集采计划审批单"]
          ]
        },
        longtermUse: {
          filters: ["长协编号", "项目名称", "采购编号"],
          cols: [
            "",
            "长协编号",
            "项目名称",
            "采购编号",
            "首选供应商",
            "备选供应商",
            "有效期",
            "采购类别",
            "是否备品备件",
            "采购预估金额",
            "累计已使用金额",
            "申请终端金额",
            "申请预估金额累计",
            "长协采购方式-比价",
            "长协采购方式-招标",
            "区域公司",
            "操作"
          ],
          toolButtons: ["add", "edit", "delete", "export", "import"],
          rows: [
            ["长协编号001", "风机备件长协项目", "CG-2024-9001", "远景能源", "金风科技", "2024-11-28 00:00:00", "物资类", "是", "1100", "320", "80", "400", "11", "1", "华北"],
            ["长协编号002", "齿轮箱供货", "CG-2024-9002", "南高齿", "采埃孚", "2024-11-29 00:00:00", "物资类", "否", "860", "210", "50", "260", "5", "0", "华东"],
            ["长协编号003", "润滑油框架", "CG-2024-9003", "壳牌", "美孚", "2024-12-01 00:00:00", "物资类", "是", "120", "30", "10", "40", "0", "0", "蒙东"],
            ["长协编号004", "电缆批次", "CG-2024-9004", "宝胜", "上上电缆", "2024-12-02 00:00:00", "物资类", "否", "2500", "980", "120", "1100", "8", "2", "西北"],
            ["长协编号005", "叶片螺栓", "CG-2024-9005", "中车紧固", "博世", "2024-12-03 00:00:00", "物资类", "是", "66", "12", "6", "18", "1", "0", "天津"],
            ["长协编号006", "箱变备件", "CG-2024-9006", "特变电工", "西电", "2024-12-04 00:00:00", "物资类", "否", "420", "100", "20", "120", "3", "1", "华中"],
            ["长协编号007", "吊装服务", "CG-2024-9007", "中远海运", "中外运", "2024-12-05 00:00:00", "服务类", "否", "300", "80", "0", "80", "0", "1", "华北"],
            ["长协编号008", "化验耗材", "CG-2024-9008", "国药集团", "本地供应商", "2024-12-06 00:00:00", "物资类", "是", "15", "4", "2", "6", "0", "0", "华东"]
          ]
        }
      };
      var state = { cfg: null, scene: scene };
      state.cfg = SCENES[state.scene] || SCENES.nonbid;
      var cfg = state.cfg;
      document.getElementById("pmTitle").textContent = titleByScene[scene] || "采购管理";
      var buttonMap = {
        add: { text: "新增", cls: "pm-btn pm-btn-add" },
        edit: { text: "修改", cls: "pm-btn pm-btn-edit" },
        delete: { text: "删除", cls: "pm-btn pm-btn-del" },
        export: { text: "导出", cls: "pm-btn pm-btn-exp" },
        import: { text: "导入", cls: "pm-btn pm-btn-imp" },
        allExport: { text: "全部导出", cls: "pm-btn pm-btn-exp" }
      };

      var statusClassMap = {
        "待审核": "pm-s1",
        "待审批": "pm-s1",
        "待审阅": "pm-s1",
        "待提报": "pm-s1",
        "待发布": "pm-s1",
        "待归档": "pm-s5",
        "已完成": "pm-s2",
        "已通过": "pm-s2",
        "已审批": "pm-s6",
        "正常": "pm-s2",
        "已驳回": "pm-s3",
        "已拒绝": "pm-s3",
        "已退回": "pm-s3",
        "已撤回": "pm-s3",
        "作废": "pm-s7",
        "草稿": "pm-s4"
      };
      if (!document.getElementById("pm-prototype-style")) {
        var st = document.createElement("style");
        st.id = "pm-prototype-style";
        st.textContent =
          ".pm-toolbar{display:flex!important;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;width:100%;}" +
          ".pm-toolbar-icons{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #e7ecf3;border-radius:6px;background:#fafbfd;}" +
          ".pm-toolbar-icons button{width:28px;height:28px;border:1px solid #e7ecf3;border-radius:4px;background:#fff;color:#5d738d;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;}" +
          ".pm-toolbar-icons button:hover{color:#1677ff;border-color:#91caff;}" +
          ".pm-op-icons{display:inline-flex;align-items:center;gap:6px;justify-content:center;}" +
          ".pm-op-icons .pm-ico{width:28px;height:28px;border:none;background:transparent;color:#1677ff;cursor:pointer;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;padding:0;}" +
          ".pm-op-icons .pm-ico:hover{background:#e6f4ff;}" +
          ".pm-field select.pm-select-inp{height:32px;border:1px solid #d9d9d9;border-radius:4px;padding:0 8px;font-size:13px;color:#333;background:#fff;min-width:200px;}" +
          ".pm-s4{color:#595959;background:#fafafa;border:1px solid #d9d9d9;}" +
          ".pm-s5{color:#389e0d;background:#f6ffed;border:1px solid #b7eb8f;}" +
          ".pm-s6{color:#d48806;background:#fffbe6;border:1px solid #ffe58f;}" +
          ".pm-s7{color:#722ed1;background:#f9f0ff;border:1px solid #d3adf7;}" +
          ".pm-table th.pm-th-op,.pm-table td.pm-ops{min-width:96px!important;width:96px!important;max-width:120px;}";
        document.head.appendChild(st);
      }
      function rowDataIndex(j, cfg) {
        if (j === 0) return -1;
        if (cfg.leadType === "expand") return j - 1;
        if (cfg.cols[0] === "") return j - 1;
        return j;
      }
      var head = document.getElementById("pmHead");
      cfg.cols.forEach(function (x) {
        var th = document.createElement("th");
        th.textContent = x;
        if (x === "操作") th.className = "pm-th-op";
        head.appendChild(th);
      });

      function buildRowTr(r) {
        var c = state.cfg;
        var tr = document.createElement("tr");
        for (var j = 0; j < c.cols.length; j += 1) {
          var td = document.createElement("td");
          if (c.cols[j] === "状态") {
            var ri = rowDataIndex(j, c);
            var s = ri >= 0 && r[ri] != null && String(r[ri]).trim() !== "" ? String(r[ri]) : "待审核";
            td.innerHTML = '<span class="pm-status ' + (statusClassMap[s] || "pm-s1") + '">' + s + "</span>";
          } else if (c.cols[j] === "") {
            if (c.leadType === "expand") {
              td.className = "pm-expand-cell";
              td.textContent = ">";
            } else td.innerHTML = "<input type='checkbox' aria-label='选择行' />";
          } else if (c.cols[j] === "附件") {
            td.className = "pm-ops";
            td.innerHTML =
              '<span class="pm-ops-inner">' +
              '<button type="button" class="pm-op-btn pm-op-btn--primary">上传</button>' +
              '<button type="button" class="pm-op-btn pm-op-btn--ghost">查看</button>' +
              "</span>";
          } else if (c.cols[j] === "操作") {
            td.className = "pm-ops";
            var ok = c.opKind || "icons";
            if (ok === "text") {
            td.innerHTML =
              '<span class="pm-ops-inner">' +
              '<button type="button" class="pm-op-btn pm-op-btn--ghost">查看详情</button>' +
              '<button type="button" class="pm-op-btn pm-op-btn--primary">修改</button>' +
              '<button type="button" class="pm-op-btn pm-op-btn--danger">删除</button>' +
              "</span>";
            } else if (ok === "iconsEditDelete") {
              td.innerHTML =
                '<span class="pm-op-icons">' +
                '<button type="button" class="pm-ico" title="修改"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>' +
                '<button type="button" class="pm-ico" title="删除"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>' +
                "</span>";
            } else if (ok === "iconView") {
              td.innerHTML =
                '<span class="pm-op-icons">' +
                '<button type="button" class="pm-ico" title="查看"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>' +
                "</span>";
            } else {
              td.innerHTML =
                '<span class="pm-op-icons">' +
                '<button type="button" class="pm-ico" title="修改"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>' +
                '<button type="button" class="pm-ico" title="查看"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>' +
                "</span>";
            }
          } else {
            var rdx = rowDataIndex(j, c);
            td.textContent = rdx >= 0 && r[rdx] != null ? r[rdx] : "";
          }
          tr.appendChild(td);
        }
        return tr;
      }

      function renderBody() {
        var body = document.getElementById("pmBody");
        body.innerHTML = "";
        (state.cfg.rows || []).forEach(function (r) {
          body.appendChild(buildRowTr(r));
        });
        document.getElementById("pmTotal").textContent = "共 " + (state.cfg.rows || []).length + " 条";
      }

      renderBody();
      var tools = document.getElementById("pmTools");
      (cfg.toolButtons || ["add", "edit", "delete", "export"]).forEach(function (k) {
        if (!buttonMap[k]) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = buttonMap[k].cls;
        btn.textContent = buttonMap[k].text;
        tools.appendChild(btn);
      });
      var tbBar = document.querySelector(".pm-toolbar");
      if (tbBar && !tbBar.querySelector(".pm-toolbar-icons")) {
        var iconBar = document.createElement("div");
        iconBar.className = "pm-toolbar-icons";
        iconBar.innerHTML =
          '<button type="button" aria-label="检索"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>' +
          '<button type="button" aria-label="刷新"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i></button>' +
          '<button type="button" aria-label="列设置"><i class="fa-solid fa-table-columns" aria-hidden="true"></i></button>';
        tbBar.appendChild(iconBar);
      }

      var filters = document.getElementById("pmFilters");
      cfg.filters.forEach(function (x) {
        var wrap = document.createElement("div");
        wrap.className = "pm-field";
        if (typeof x === "string") {
        var label = document.createElement("label");
        label.textContent = x || " ";
        var input = document.createElement("input");
        input.placeholder = x ? "请输入" + x : "";
        wrap.appendChild(label);
        wrap.appendChild(input);
        } else if (x && x.type === "select") {
          var lab = document.createElement("label");
          lab.textContent = x.label || " ";
          var sel = document.createElement("select");
          sel.className = "pm-select-inp";
          (x.options || []).forEach(function (opt) {
            var o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            sel.appendChild(o);
          });
          wrap.appendChild(lab);
          wrap.appendChild(sel);
        }
        filters.appendChild(wrap);
      });

      var resetBtn = document.getElementById("pmResetBtn");
      var searchBtn = document.getElementById("pmSearchBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", function (e) {
          e.preventDefault();
          document.querySelectorAll("#pmFilters input, #pmFilters select").forEach(function (inp) {
            inp.value = "";
          });
        });
      }
      if (searchBtn) {
        searchBtn.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }

      var M = window.DemoListFormModal;
      if (M) {
        M.autoBindTablePage({
          root: "[data-list-form-demo]",
          moduleName: "#pmTitle",
          cols: function () {
            return state.cfg.cols;
          },
          tbody: "#pmBody",
          toolbar: "#pmTools",
          hooks: {
            onAdd: function (map, keys) {
              state.cfg.rows.push(M.rowArrayFromMap(map, keys));
              renderBody();
            },
            onEdit: function (index, map, keys) {
              state.cfg.rows[index] = M.rowArrayFromMap(map, keys);
              renderBody();
            },
            onDelete: function (index) {
              state.cfg.rows.splice(index, 1);
              renderBody();
            },
            onImportDone: function () {
              renderBody();
            }
          }
        });
      }
    })();
