本插件为因ai创造革新等东西时名称和描述依托而创作，让mod制作者可以更好的创作需要名称以及描述的革新事件等
# PDX 模改工坊 / PDX Forge

DSH 侧边栏插件：填名称与描述、挑修正、让 AI 补触发与效果，实时生成欧陆风云 5 的脚本与本地化，并写进 MOD 的**指定文档**或新建文档。

- 侧边栏「插件」「定时任务」之后多一个图标，点开是主面板。
- 已确认的数据源存放在插件目录的 `sources.json`，重启后自动恢复。

## 安装

1. 克隆或下载本仓库到任意目录；
2. 在 DSH 里从这个目录安装 bundle（仓库带 `dsh.bundle.patch`，安装后 profile 会以 Junction 指向该目录）；
3. **重启 DSH 桌面端**，左侧栏会出现「PDX 模改工坊」图标。

首次打开后到「数据源」页填两条路径：

- 原版：`…\Steam\steamapps\common\Europa Universalis V\game`
- 你的 MOD 根目录（含 `in_game/` 的那一层）

之后会写入 `sources.json`，重启不用再填。仓库不包含该文件（已在 `.gitignore` 里排除）。

## 数据从哪来（重要）

插件**不内置任何抓取快照**。Host 端（`index.js`）按「数据源」列表逐个扫描：

- 每个源都读：`in_game/common/advances`、`in_game/common/age`、`in_game/common/estates`、`in_game/common/laws`、`in_game/common/decision_categories`、`main_menu/common/modifier_type_definitions`、`in_game/common/modifier_type_definitions`
- 每个源也读自己的 `simp_chinese` 本地化（原版源还会读全部 DLC 的本地化）

默认数据源是**原版游戏**与**当前 MOD**；可在「数据源」页加更多目录（见下）。

因此：

- 面板里出现的修正与革新，一定是这些目录里真实存在的；来自 MOD 的会标出该 MOD 的名字。
- 发出去的插件不会带上你的 MOD 私有内容；别人装上后看到的是他自己配置的数据源。
- 游戏或 MOD 新增内容后，点「重新扫描游戏数据」即可（Host 侧另有 60 秒缓存）。

插件已不在 MOD 目录里，所以**不会**再自动推断 MOD 根：首次运行用面板「数据源」把 MOD 路径加进去（原版路径同理），之后会写进插件目录的 `sources.json`，重启自动恢复。游戏目录在常见 Steam 路径里探测；也可在 `cordis.patch.yml` 的 `config` 里覆盖 `gameRoot` / `modRoot`。

### 本地化来源与名称解析

扫描器会读取**原版本体 + 所有已安装 DLC + 当前 MOD** 的 `simp_chinese` 本地化（`main_menu/localization/simp_chinese` 与 MOD 的 `in_game/localization/simp_chinese`），所以像内阁行动名、普罗尼亚这类只在 DLC 文本里的条目也能对上。

修正名里常见的三种引用都会展开：

- `$a_clan_retainer_cavalry$招募花费` → 「骑马旗本武士招募花费」（`$...$` 键引用）
- `允许$assimilate_area$` → 「允许同化地区」（内阁行动名）
- `可使用[ShowCharacterInteractionNameWithNoTooltip('cas_appoint_adelantado_mayor')]` → 「可使用任命边境大先遣官」（`[Func('id')]` 动态命令）
- `[war|e]` 这类概念引用按 `game_concept_<名字>` 解析

解析不到的引用会被丢弃、只保留可读部分；完全没有中文名的条目（多见于 MOD 自己新增却没写 `MODIFIER_TYPE_NAME_*` 的修正）退回脚本 ID。

### 游戏内隐藏的修正

有些定义带 `should_show_in_modifiers_tab = no`，例如 `ambition_slots`（野心名额）——它们在基础数据里已经存在，但游戏界面不显示，属于尚未启用的系统。工坊仍会列出这些条目并打「游戏内隐藏」徽章，以免你在游戏里找不到对应修正时误以为列表出错。

### 修正分类

先分四个大类，再在其下按主题分子类：

| 大类 | 子类 |
|---|---|
| 国家 | 阶层 / 军事 / 经济 / 外交 / 行政 / 文化宗教 / 其他（只保留条目足够多的） |
| 地点 | 阶层 / 经济 / 军事 / 其他 |
| 角色 | 无子类（角色修正本来就少，直接一个列表） |
| 其他 | 无子类（国际组织、宗教、叛乱、通用等） |

- 雇佣兵、省份、王朝这些只有个位数条目的分类不再单独出现，直接并入所属大类。
- 子类是按修正键名归类的（如 `global_nobles_estate_power` → 阶层、`land_morale_modifier` → 军事），少于 40 条的主题不会占用子类名额，会并回「全部」。
- 默认停「国家」，一打开就按「常用程度 + 字母」列出该类全部条目，可再切子类或搜中文名/键名。

### 数据源（多路径）

「数据源」标签页维护扫描目录，默认已经包含**原版游戏**与**当前 MOD**：

- 可以再加入任意目录（联动 MOD、汉化、子 MOD），类型选「原版 / MOD」。
- 添加或删除后立即重新扫描，并逐个显示该目录贡献了多少革新、修正、时代、阶层。
- 路径无效会标红并说明原因，不会拖垮其它数据源。
- 时代、阶层、决议分类、法律分类都来自所有数据源，所以 MOD 新增的时代会出现在「时代」下拉里。
- 修正与革新选择器右上角有「来源」过滤，可以只看原版或只看某个 MOD。

设置存在浏览器本地，重启后仍然保留；换机器或换目录时在「数据源」里改即可。

## 能生成什么

| 标签 | 产物 | 默认落点 |
|---|---|---|
| 革新 | `age` / `icon` / `potential` / 多条 `requires` / `unlock_*` / 修正 | `in_game/common/advances/<id>.txt` |
| 决议 | `decision_category` / `potential` / `allow` / `ai_will_do` / `option{effect}` | `in_game/common/decisions/<id>.txt` |
| 事件 | `namespace` + `ns.N` + `trigger` + `option` | `in_game/events/<ns>.txt` |
| 特权 | `estate` / `potential` / `allow` / `country_modifier` | `in_game/common/estate_privileges/<id>.txt` |
| 法律 | `law_category` / `potential` / `allow` + 若干政策块 | `in_game/common/laws/<id>.txt` |

- 决议/事件选了修正时，会额外生成静态修正文件（`main_menu/common/static_modifiers/`）并在效果里写 `add_country_modifier = { months = -1 }`。
- 每个类型都给出 `l_simp_chinese:` 本地化块，键名按原版约定：`<id>` / `<id>_desc`、`<id>.title` / `<id>.desc` / `<id>.a`、`<id>_CATEGORY`、`STATIC_MODIFIER_NAME_*`。
- 「接在哪个革新之后」= `requires`，输入中文名或 ID 即搜，可多选；也可把新建的革新「记入前置库」。

## 写入 MOD

「写入 MOD」右边的 **▾** 展开写入位置：

- **脚本文件** / **本地化文件**：默认新建（文件名可改，预填 `<id>.txt` / `<id>_l_simp_chinese.yml`）。
- 点「浏览…」会**打开 Windows 文件选择窗口**（资源管理器对话框），起始目录就是该类型的脚本目录或 `in_game/localization/simp_chinese`；选中的文件显示为相对路径，点 × 改回新建。
- 对话框过滤：脚本只列 `*.txt`，本地化只列 `*.yml`；选到 MOD 目录之外的文件会被拒绝。

选已有文档时是**追加**，不覆盖原内容：

- 脚本按顶层 id 去重：该文件里已经有 `example_xxx = {` 就跳过。
- 本地化按 key 去重，并插入到 `l_simp_chinese:` 段之后；目标文件没有这个段会直接报错而不是乱写。

写入时自动建目录、自动补 UTF-8 BOM，路径越界会被拒绝；成功后会静默刷新一次数据，新革新马上能当前置选。

## 编辑已有内容

每种类型的表单顶部有「编辑已有条目」▾：

- 展开后从**MOD 数据源**里列出已有条目（革新 / 决议 / 事件 / 特权 / 法律按当前标签自动切换），支持中文名或 ID 搜索；
- 选中后直接显示该条目的脚本块（`id = { ... }`），可以整体修改后保存；
- 保存采用**块替换**：只替换这一个条目，文件里其它条目、注释、空行与 UTF-8 BOM 全部原样保留；块内嵌套的 `potential` / `effect` / `option` 等结构不会被拆散；
- 条目在文件里找不到（改名/移动）会直接报错，不会误改别的块；
- **原版数据源只读**，列表里不会出现原版的条目——要改原版内容，用生成器新建一个同 ID 条目覆盖即可。

脚本块下方是**本地化**编辑区：

- 自动带出该条目相关的所有文本键：`<id>`（名称）、`<id>_desc`（描述）、决议/事件的 `<id>.title` / `<id>.desc` / `<id>.a`…，以及法律政策等子条目的名称与描述；
- 每行标注来源：`MOD 内` = 直接改原文件里那一行；`写入覆盖` = 文本在原版里，保存时在当前 MOD 新建一条同名覆盖；`新建` = 原本没有这个键；
- 保存只改你动过的行，同一 yml 的其它键、注释与 BOM 都保留。

## AI 助手

每个表单里都有一块「AI 助手」：用中文写需求（例如「只有和平时期可用，花费 100 金币换 50 威望」），点「AI 生成触发与效果」，Host 会调用**当前 profile 的默认模型**，返回并填入 `potential` / `allow` / `trigger` / `effect` / `option`（按内容类型取对应字段）。

- 只在你点按钮时才发请求。
- 模型没配置或调用失败时，面板会显示原因，字段保持原样。
- 生成的是脚本行；落盘前可以自己再改。

## 维护与自检

```powershell
node tools/check-labels.mjs   # 修正/革新名的占位符解析结果
node tools/host-test.mjs      # 扫描器：分类、中文名、搜索、耗时
node tools/route-test.mjs     # Host 接口：数据 / 扫描 / 条目 / 取块 / AI 错误路径 / 写入、追加、块替换、BOM、越界
node tools/edit-test.mjs      # 取块、括号匹配（含注释与字符串）、块替换、越界拒绝
node tools/dialog-probe.mjs   # 真开一次系统文件对话框并在 3 秒后取消
node tools/render-smoke.mjs   # 用 React shim 渲染五种表单、加载/预留分支与写入目标路由
```

改完 `client.js` 或 `index.js` 需要**重启桌面应用**（Host 端只在启动时加载）；只改样式的话刷新页面即可。

## 注意

- 写入时会给所有 `.txt`/`.yml` 加 BOM；`main_menu/setup/` 与 `.gui` 不要 BOM，这两类目录请手动处理。
- 本地化颜色码后必须留一个空格（`#R -30%#!`），否则字符串会被截断。
- 扫描只读不写；写盘仅由「写入 MOD」按钮触发。
- 文件选择窗口由 Host 调起 Windows 的 WinForms 对话框，路径通过临时文件回传（不走管道），需要桌面会话可交互。

## 扩展其他 P 社游戏

- `client.js` 顶部 `GAMES` 登记游戏条目；未就绪的条目点开是「接口预留」说明。
- Host 端 `scanProject()` 返回统一形状：`{ meta, modifiers, advances, roots, counts }`。换游戏就是换一个扫描器实现。
- `GENERATORS` / `FORMS` 按内容类型拆分，字段与选择器都从 `data.meta` 取，新增游戏只需补 `gen*` 与对应表单。
