# 前端资源调研：校园跑腿互助平台（双手机演示页）

> 调研日期：2026-11-01（洛杉矶时间）。只看了 README、文档和文件内容，没有运行任何下载来的代码，也没写作品代码。
> Star、许可证、最近推送时间：GitHub API 当天取值。
> 体积：下载文件后本地测量，`原始 / gzip`（`gzip -c` 算出，实际传输大小可能略有差别）。

## 结论

**推荐组合：`picturepan2/devices.css`（外框）+ WeUI 的 CSS（界面）+ 浏览器原生 Web Animations API（动效），文件全部放进仓库。** 需要下载的文件 gzip 后合计约 31 KB，不用构建，页面运行时不依赖任何外部 CDN 或字体。

**有两点要先知道：**

1. **最大的风险是 github.io 本身，换前端资源解决不了。** GreatFire 的记录里，github.io 下各子域情况不一（见第 4 节），而 `lijiajie-git.github.io` 没有测试记录。提交前要在大陆网络下实测。
2. **WeUI 没有胶囊按钮，也没有小程序顶部导航栏。** 状态栏、导航栏、胶囊要自己写，这几块也正是最能体现「小程序感」的地方。

## 1. 手机外框

| 候选 | 许可证 | 最近推送 | Star | 体积 | 不构建可用 | 判断 |
|---|---|---|---|---|---|---|
| [picturepan2/devices.css](https://github.com/picturepan2/devices.css) | MIT | 2023-12-29 | 2,429 | 50.5 KB / 7.3 KB（全部机型） | 可以，`dist/devices.min.css` 是现成 CSS | **推荐**。有 iPhone 14 Pro，含灵动岛 |
| [marvelapp/devices.css](https://github.com/marvelapp/devices.css) | MIT | 2023-01-10 | 3,957 | 42.9 KB / 6.0 KB | 可以 | 备选。最新机型只到 iPhone X、Note 8，最新 release 是 2017 年 |
| [saadeghi/daisyui](https://github.com/saadeghi/daisyui) 的 `mockup-phone` | MIT | 2026-10-31 | 42,725 | 单组件 3.1 KB / 1.1 KB | 文件能单独取，但用到 daisyUI 的颜色变量和 CSS 层，需要补变量或引入主题 | 备选。只想要极简外框时考虑，单独使用的效果没有实测 |

**picturepan2 的使用注意**（前两条读源码确认，后果按 CSS 规则推断，没有实测）：

- **高度放不下。** iPhone 14 Pro 外框固定 428×868，屏幕 390×830。笔记本浏览器的可视高度估计只有 650–800 px，所以一定要按窗口高度整体缩放。缩放约 0.72–0.8 时，17px 字显示为 12–14px，还能看清；再小就难读了。
- **`.device-screen` 默认按 `<img>` 设计。** README 的示例是图片，且基础样式里没有 `overflow:hidden`。放 `<div>` 做界面时要自己加，否则内容会超出屏幕圆角。
- **`.device` 带 `transform:scale(1)`。** 里面 `position:fixed` 的元素会以整台手机（含边框）为定位基准，而不是屏幕。WeUI 的 `dialog`、`half-screen-dialog`、`actionsheet` 都是 fixed，所以要给屏幕容器也加 transform，让弹层只盖住屏幕。
- **飞卡动画不能放在手机里面。** 手机屏幕要裁切内容，卡片会被切掉。应该在页面最外层放一层覆盖层，用 `getBoundingClientRect` 取两端坐标；这个方法返回的已是缩放后的值，不用再换算。

## 2. 微信小程序风格 UI

| 候选 | 许可证 | 最近推送 | Star | 体积 | 不构建可用 | 判断 |
|---|---|---|---|---|---|---|
| [Tencent/weui](https://github.com/Tencent/weui) v2.6.26 | MIT（第三方依赖例外，见 LICENSE.txt；API 显示未识别，npm 标 MIT） | 2026-03-12 | 27,450 | 187.9 KB / 23.5 KB | 可以，纯 CSS，图标内嵌，文件里没有外部字体 | **推荐**。官方设计语言，最像微信 |
| [youzan/vant](https://github.com/youzan/vant) v4.10.2 + Vue 3 | MIT | 2026-10-29 | 24,407 | Vant JS 80.2 KB + CSS 52.9 KB + Vue 62.2 KB，均为 gzip，合计约 195 KB | 文件存在（`lib/vant.min.js`、`lib/index.css`、`vue.global.prod.js`）；文档页抓不到，CDN 写法没有从文档确认 | 备选。组件多（选择器、滑动单元格等），但外观是有赞风格，不是微信原生 |
| [framework7io/framework7](https://github.com/framework7io/framework7) v9.2.0 | MIT | 2026-10-30 | 18,773 | JS 210.3 KB + CSS 72.4 KB，均为 gzip | 可以 | 不推荐（见第 5 节） |

**WeUI 有什么、缺什么**（检查 `weui.min.css` 的类名）：

- **有：** `weui-cell(s)` 列表、`weui-tabbar` 底部导航、`weui-btn`、`weui-form`、`weui-half-screen-dialog` 半屏弹层、`weui-dialog`、`weui-actionsheet`、`weui-toast`、`weui-msg` 结果页、`weui-steps` 步骤条（适合展示订单状态）、`weui-grid`、`weui-panel`、`weui-loadmore`。
- **缺：** 文件里搜不到 `navigation`、`capsule`、`menu-button`。胶囊按钮、顶部导航栏、状态栏要手写；底部导航的图标也要自备，可用 [tabler/tabler-icons](https://github.com/tabler/tabler-icons)（MIT，22,521 星，2026-10-29 推送），复制所需 SVG 内联即可。
- **胶囊尺寸：** iOS 上常用 87×32，上下边距 4，距右边缘约 7。这是[微信开放社区的经验值](https://developers.weixin.qq.com/community/develop/doc/000a66ec750d186d096c84bc856c00)，不是官方规范。官方只提供运行时接口 [`getMenuButtonBoundingClientRect`](https://developers.weixin.qq.com/minigame/dev/api/ui/menu/wx.getMenuButtonBoundingClientRect.en.md)，网页里用不了。做演示写死就够了。

**WeUI 的使用注意：**

- **评审者系统是深色模式时，手机界面会跟着变黑。** CSS 里有 `prefers-color-scheme:dark` 规则，只有 `body` 设了 `data-weui-theme="light"` 才不会触发。如果页面不打算做深色，就把这个属性加上。
- **字体栈是 `system-ui,-apple-system,Helvetica Neue,sans-serif`。** 建议加上 `"PingFang SC","Microsoft YaHei"`，让 Windows 上的中文显示更稳定。
- **`weui.js` 不需要。** 它只提供弹窗等 JS 调用，自己切换 CSS 类就能实现。

**不能直接用的：** [Tencent/weui-wxss](https://github.com/Tencent/weui-wxss) 是小程序里的 wxss 版本，不是给普通网页用的。

## 3. 动效

| 候选 | 许可证 | 最近推送 | Star | 体积 | 不构建可用 | 判断 |
|---|---|---|---|---|---|---|
| 原生 [Web Animations API](https://caniuse.com/web-animation)（`Element.animate`） | 浏览器内置 | 不适用 | 不适用 | 0 | 可以 | **推荐**。全球支持 97.2%；Chrome/Edge 84+、Safari 13.1+、Firefox 75+；QQ 浏览器 14.9 标为部分支持 |
| [greensock/GSAP](https://github.com/greensock/GSAP) 3.15.0 | [Standard "No Charge" 许可](https://gsap.com/standard-license)，不是开源许可；可免费商用，限制主要针对开发竞品，不能删版权声明 | 2026-04-13 | 30,029 | 72.9 KB / 28.4 KB | 可以，单文件 | **需要升级时选它**。时间线适合「发单→飞卡→接单端亮起」这种连续动作 |
| [motiondivision/motion](https://github.com/motiondivision/motion) 14.9.0 | MIT | 2026-11-01 | 34,778 | `dist/motion.js` 179.0 KB / 59.7 KB | 可以，全局变量 `Motion` | 备选。官方说 mini 版约 3.2 KB，但包里没有 mini 单文件，CDN 版还会继续加载 `motion-dom` 等模块，不方便放进仓库 |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) v4.5.0 | MIT | 2026-08-21 | 74,179 | 118.0 KB / 40.7 KB | 可以，UMD | 备选。比 GSAP 大，这个场景下没有明显优势 |

**可选点缀：** [catdad/canvas-confetti](https://github.com/catdad/canvas-confetti)（ISC，12,841 星，1.9.4，10.8 KB / 4.5 KB，不用构建），订单完成时放一次彩带。

**状态提示：** 直接用 WeUI 的 `weui-toast` 和 `weui-steps`，不用另装提示库。

**为什么页面切换不用 View Transitions：**

- 它在 [Chrome/Edge 111、Safari 18、Firefox 144](https://caniuse.com/view-transitions) 起才支持，caniuse 显示 QQ 浏览器 14.9、百度浏览器 13.52 不支持。
- 单文档模式是对整个页面截图过渡。两台手机在同一页时，一边切页可能牵连另一边（按 API 机制推断，没有实测）。

手机内切页用 Web Animations API 做位移就够了。

**实现上的一条建议：** 状态更新不要等动画结束再执行。动画在 QQ 浏览器这类环境里可能跑不完整，状态先更新，就算动画失败，业务流程也不会卡住。

## 4. CDN 和字体在中国大陆的情况

**先说局限：我在美国，没法从大陆实测。** 下面的数据来自第三方 GreatFire，它只测连接是否被封，不测速度，而且针对的是具体 URL。

| 地址 | GreatFire 记录 | 怎么理解 |
|---|---|---|
| [cdn.jsdelivr.net](https://en.greatfire.org/https/cdn.jsdelivr.net) | 未被封，0/4 受干扰（2026-10-16） | 比[2022 年的封锁报道](https://discourse.psychopy.org/t/cdn-jsdelivr-net-has-been-blocked-in-china-is-there-any-possible-change-the-source-of-css/29212)好，但速度未知，不能当运行时依赖 |
| [unpkg.com](https://en.greatfire.org/https/unpkg.com) | 根地址未被封（2026-10-21）；域名下 38 个 URL 中 2 个被封、29 个受干扰 | 具体文件路径可能打不开，不要依赖 |
| [fonts.googleapis.com](https://en.greatfire.org/https/fonts.googleapis.com) | 未被封，0/4 受干扰（2026-10-15） | 只测了这一个样式表域名；字体文件所在的 `fonts.gstatic.com` 没查。中文网页字体本来就很大，也不值得用 |
| [github.io](https://en.greatfire.org/github.io) | 「Mixed」（2026-10-11）：1,102 个 URL 中 531 可访问、303 受干扰、161 被封、107 无结论 | **本次最大风险。**不同子域结果不同，不能推断 `lijiajie-git.github.io` 的情况 |
| [lijiajie-git.github.io](https://en.greatfire.org/https/lijiajie-git.github.io) | 未测试过 | 页面上有发起测试的按钮，我没点，因为这会把地址提交给第三方，由主窗口决定 |

**处理办法：**

1. **所有资源同源。** 依赖文件全部放进仓库，页面打得开，样式和动效就都在，不会出现「页面开了但样式没加载」的情况。
2. **不用网络字体。** 用系统字体：`-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`。
3. **提交前实测。** 让大陆的朋友不开代理，用电脑打开一次，再用手机流量打开一次。也可以用 itdog、boce 这类国内拨测站（没有实际验证过这两个站）。

**把文件放进仓库的方法**（以下地址 2026-11-01 从美国请求都返回 200；在主窗口的网站仓库里执行）：

```bash
mkdir -p vendor
```

```bash
curl -fL -o vendor/devices.min.css https://cdn.jsdelivr.net/gh/picturepan2/devices.css@master/dist/devices.min.css
```

```bash
curl -fL -o vendor/weui.min.css https://cdn.jsdelivr.net/npm/weui@2.6.26/dist/style/weui.min.css
```

可选，要用时再下：

```bash
curl -fL -o vendor/confetti.browser.min.js https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js
```

```bash
curl -fL -o vendor/gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js
```

GSAP 这条里的 3.15.0 是 npm 当前版本，我测量时用的地址是 `gsap@3`，这个固定版本的地址没有单独请求过。

MIT 和 ISC 都要求保留版权声明。建议在 `vendor/` 里放一份说明，写明各文件的来源和许可证。

## 5. 明确不推荐

| 选项 | 原因 |
|---|---|
| **BootCDN、Bootcss、Staticfile** | 2024 年 [polyfill.io 供应链攻击](https://itpro.com/security/millions-of-sites-couldve-been-exposed-in-the-polyfill-bootcdn-bootcss-and-staticfile-attack-and-it-was-all-orchestrated-by-a-single-operator)牵涉这几个域名，它们常被当作国内 CDN 推荐，但不能用 |
| **任何运行时 CDN** | 只有一次评审机会，第三方 CDN 慢或打不开都没有补救机会；放进仓库几乎没有成本 |
| **Google Fonts、Noto Sans SC 等网络字体** | 加载没有保证，中文字体体积大，系统字体已经够用，而且更接近微信的实际观感 |
| **animate.css** | 许可证是 Hippocratic 2.1，不是常规开源许可；最新 release 还是 2020 年；71.8 KB 里大部分动画用不上，几段 keyframes 就能替代 |
| **Framework7** | gzip 后约 283 KB；本身是一套完整的 App 框架，外观走 iOS/Material，不是微信风格 |
| **[anseki/leader-line](https://github.com/anseki/leader-line)** | 仓库已归档，gzip 后 28.8 KB；手机之间的连线用一段内联 SVG 就够了 |
| **[pixelsign/html5-device-mockups](https://github.com/pixelsign/html5-device-mockups)** | 仓库约 257 MB，含 111 个 PNG 和 28 个 PSD，比纯 CSS 外框笨重得多 |
| **[caroso1222/notyf](https://github.com/caroso1222/notyf)、[apvarun/toastify-js](https://github.com/apvarun/toastify-js)** | 最新 release 分别是 2019 年和 2022 年；WeUI 自带 toast，不用再加 |
| **[weilanwl/coloruicss](https://github.com/weilanwl/coloruicss)** | 2024-04 后没有推送；定位是小程序样式，用在网页上的效果没有核实 |
| **Tencent/weui-wxss** | 小程序格式，普通网页用不了 |

## 6. 给主窗口的决策提示

- **要不要上 Vue。** 两台手机共享一份订单状态是这个页面的核心。原生 JS 写一个「状态改变→重绘两边」的函数就够用。如果想让代码更简洁，可以只加 Vue 全局版（gzip 后 62.2 KB，单文件，不用构建），配 WeUI CSS，不必再加 Vant。
- **外框是否用灵动岛。** iPhone 14 Pro 外框的灵动岛和小程序顶部导航栏要错开：灵动岛在屏幕外框顶部约 29px 处、高 35px，所以状态栏要留够高度，导航栏和胶囊放在其下。

## 7. 没有核实的地方

- **大陆实际可达性和速度：** 都没有实测，只有 GreatFire 的连接记录。
- **所有代码组合：** 没有写 demo，第 1、2 节的外框与 WeUI 配合问题是读 CSS 推断的，第一次搭页面时要验证。
- **笔记本可视高度和缩放比例：** 是估算值，不是实测。
- **胶囊尺寸：** 社区经验值，不同机型可能不同。
- **Vant 的 CDN 用法、WeUI 官方示例站内容：** 两个文档站都是单页应用，抓取时拿不到内容。WeUI 的组件清单来自 CSS 类名，不是官方文档。
- **国产浏览器支持：** caniuse 只有 QQ、百度、UC 几个版本的数据，360 等其他浏览器没有。
- **[npmmirror](https://registry.npmmirror.com/weui/2.6.26/files/dist/style/weui.min.css) 作为备用下载源：** WeUI 文件可取，但 `motion` 的文件返回了 403，所以不把它当可靠来源。
- **coloruicss 的具体内容：** 只看了仓库元数据，没有逐文件读。

**调研用量：** 搜索 6 次，网页读取 11 次，都在上限内。另外用 GitHub API 和 curl 取了仓库元数据和待测文件，放在临时目录里只做测量和文本检查，没有执行，用完已删除。

## 来源

- GitHub API（各仓库元数据）、npm registry（版本和许可证字段）
- [GSAP 标准许可](https://gsap.com/standard-license)、[Motion 快速上手](https://motion.dev/docs/quick-start)
- caniuse：[View Transitions](https://caniuse.com/view-transitions)、[Web Animations](https://caniuse.com/web-animation)
- GreatFire：见第 4 节各行链接
- [ITPro：polyfill / BootCDN / Bootcss / Staticfile 事件报道](https://itpro.com/security/millions-of-sites-couldve-been-exposed-in-the-polyfill-bootcdn-bootcss-and-staticfile-attack-and-it-was-all-orchestrated-by-a-single-operator)
- [微信开放社区：胶囊尺寸讨论](https://developers.weixin.qq.com/community/develop/doc/000a66ec750d186d096c84bc856c00)、[微信官方接口文档](https://developers.weixin.qq.com/minigame/dev/api/ui/menu/wx.getMenuButtonBoundingClientRect.en.md)
