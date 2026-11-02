/* 调研依据和参考链接。只放 调研/A、B、C、E 里标 [来源确认] 的链接；竞品只写文字，不放截图。
   SOURCES 是链接表；STEPS 的 basis 和下面的 RESEARCH 都按键名引用。 */
window.SOURCES = {
  thepaper2025: { label: '澎湃新闻', note: '2025', url: 'https://www.thepaper.cn/newsDetail_forward_30767482' },
  nbd2017: { label: '每日经济新闻', note: '2017，年份旧', url: 'https://www.nbd.com.cn/articles/2017-05-18/1107251.html' },
  zhihuOperator: { label: '知乎回答', note: '运营者自述，带推广', url: 'https://www.zhihu.com/question/276350214' },
  tide2026: { label: '潮新闻', note: '2026，单人粗估', url: 'https://tidenews.com.cn/news.html?id=3491664' },
  zhihuUnpaid: { label: '知乎专栏', note: '个人自述', url: 'https://zhuanlan.zhihu.com/p/1946564738587812423' },
  anlaiye163: { label: '网易号文章', note: '报道数字', url: 'https://www.163.com/dy/article/JM9DQQVB05567AZC.html' },
  huxiu2025: { label: '虎嗅', note: '2025', url: 'https://www.huxiu.com/article/4766351.html' },
  payRule: { label: '非银行支付机构监督管理条例', note: '政府网站', url: 'https://www.gov.cn/zhengce/zhengceku/202312/content_6920725.htm' },
  gmw2025: { label: '光明网', note: '2025，校园外卖', url: 'https://m.gmw.cn/2025-07/24/content_1304092142.htm' },
  zhihuDispute: { label: '知乎回答', note: '单人自述', url: 'https://www.zhihu.com/question/421082323' },
  essc2024: { label: 'ESSC 2024 会议论文', note: '外卖，60 名学生，只读到摘要', url: 'https://www.atlantis-press.com/proceedings/essc-24/126009832' },
  nimRating: { label: 'NIM Marketing Intelligence Review', note: '海外平台数据', url: 'https://www.nim.org/fileadmin/PUBLIC/12_NIM_MIR_Issues/MIR_Die_Reputation_Economy/MIR_Die_Reputation_Economy_EN/holtz_fradkin_vol_12_no_2_eng.pdf' },
  doubanPickup: { label: '豆瓣帖子', note: '2020，个人说法，年份旧', url: 'https://www.douban.com/group/topic/200129037/' },
  zhihuTail: { label: '知乎回答', note: '2020，个人回答，年份旧', url: 'https://www.zhihu.com/question/323620327' },
  sspai2026: { label: '少数派', note: '2026，作者个人文章', url: 'https://sspai.com/post/106611' },
  cainiaoStore: { label: '菜鸟 App 商店页', note: '只写了亲友绑定和一键代取', url: 'https://apps.apple.com/cn/app/%E8%8F%9C%E9%B8%9F-%E5%BF%AB%E9%80%92%E8%BD%BB%E6%9D%BE%E6%9F%A5%E5%AF%84%E5%8F%96/id951610982?uo=4' }
};

window.RESEARCH = {
  title: '调研依据',
  speed: '调研窗口约 16:36 开始，16:51 写完第一轮 A 到 D 四份，到 22:40 前后累计 A 到 H 八份。',
  limits: [
    '证据多来自校园外卖，不是同学之间的跑腿互助，拿来说跑腿要打折扣。',
    '知乎和豆瓣只读了几篇，贴吧、小红书没有读到。下面标了个人自述、带推广和年份旧的来源。',
    '竞品只看了本人截的 14 张截图，截图只留本地。“没看到”不等于对方没有。'
  ],
  groups: [
    {
      h: '代取要解决的是“出事有人管”',
      points: [
        { t: '现有证据不支持把“信任”笼统当成首要痛点。最常见的抱怨是东西丢了或找不到、送得慢、出事找不到人。所以我们讲可信任，讲的是过程看得见、出事有人管，不是只打一个信用分。', links: ['gmw2025'] },
        { t: '外卖调查里，约一半学生提到订单丢失；样本小，也不是跑腿。', links: ['essc2024'] },
        { t: '同学代拿放楼下丢了，协商赔一半，发单人说以后不再找代拿。', links: ['zhihuDispute'] }
      ]
    },
    {
      h: '一件一跑不划算，所以抢一批',
      points: [
        { t: '查到的主体是校园外卖到寝和校内转配，代取是附带业务，有报道写明代取单优先级低于送餐单。', links: ['thepaper2025'] },
        { t: '单价低：2017 年报道里代取 3 元；2026 年一位大一学生自述 1 至 1.5 元，月入约 150 元。收入靠一趟能带几件，是我们的推断。', links: ['nbd2017', 'tide2026'] },
        { t: '有运营者试过学生抢单后放弃，改成集中取件、楼长送楼。这是对抢单模式的反面证据；我们的应对是用信用和批次约束接单，这是我们的判断。', links: ['zhihuOperator'] }
      ]
    },
    {
      h: '隐私和取件凭证',
      points: [
        { t: '取件要靠取件码、身份码还是手机尾号，各站不一样；依据多是 2020 年的帖子，现状要到站确认。', links: ['doubanPickup', 'sspai2026'] },
        { t: '有回答说报姓名和尾号就能领，而这两项在盒子上就看得到。所以取件码只给抢到批的同学。', links: ['zhihuTail'] },
        { t: '官方代取功能存在，但设计给亲友。商店页没写能否授权给陌生同学。', links: ['cainiaoStore'] }
      ]
    },
    {
      h: '钱和信用',
      points: [
        { t: '有代拿的同学自述不少人忘记给钱，要逐个追。所以先付，确认后结算。', links: ['zhihuUnpaid'] },
        { t: '有平台被报道拖欠学生配送费和商户货款。未经批准不得从事支付业务，所以原型的托管只是模拟，真实上线要走持牌通道。', links: ['anlaiye163', 'payRule'] },
        { t: '评分本身不够用：Upwork 到 2014 年 80.7% 的评分落在 4.75 到 5 星。所以信用看履约，并决定能抢多大。', links: ['nimRating'] },
        { t: '学校既是准入方，也能决定生死；这个作品按前提假设学校允许进入，不讨论准入。', links: ['huxiu2025'] }
      ]
    },
    {
      h: '我们看的产品',
      points: [
        { t: '我们看的两个校园跑腿小程序里没看到批次、丢件赔付、保价、信用分和自动打码。一个把取件码单独放进“仅接单员可见”，另一个在公开大厅显示楼栋楼层。规格宫格和订单卡的结构参考了它们。', links: [] }
      ]
    }
  ]
};
