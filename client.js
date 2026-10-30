window.__ModuleLoader__.load({
  id: '@local/pdx-forge',
  factory(require) {
    const React = require('react')
    const e = React.createElement
    const { useState, useEffect, useMemo, useCallback, useRef } = React

    const NS = 'pdxForge'
    const STORE_KEY = 'pdx-forge.v2'

    /* ------------------------------------------------------------------ i18n */
    const I18N = {
      zh: {
        'panel.title': 'PDX 模改工坊',
        'panel.subtitle': '欧陆风云5 · 脚本生成',
        'game.eu5': '欧陆风云5',
        'game.more': '接口预留',
        'soon.title': '该游戏的生成器接口已预留',
        'soon.body': '工坊把「游戏」和「内容类型」拆成两层：Host 负责扫描本机游戏与 MOD 的脚本数据，界面只依赖一份统一的数据形状。新增一款 P 社游戏时，只要换掉扫描器、登记它的数据与 gen* 模板，表单与修正选择器都可以原样复用。',
        'tab.advance': '革新',
        'tab.decision': '决议',
        'tab.event': '事件',
        'tab.privilege': '特权',
        'tab.law': '法律',
        'sec.basic': '基本信息',
        'sec.ai': 'AI 助手',
        'sec.trigger': '触发条件',
        'sec.mods': '修正',
        'sec.unlock': '解锁内容',
        'sec.option': '选项与效果',
        'sec.policy': '政策',
        'f.id': '脚本 ID',
        'f.idHint': '字母、数字、下划线，全局唯一',
        'f.name': '名称',
        'f.desc': '描述',
        'f.descHint': '颜色码后必须留一个空格，如 #R -30%#!',
        'f.tag': '国家 TAG',
        'f.tagHint': '留空则不限制国家',
        'f.potential': '触发条件 potential',
        'f.potentialHint': '不用自己写：在 AI 助手里用中文描述，或直接手改脚本',
        'f.allow': '可行条件 allow',
        'f.allowHint': '留空则任何时刻都能点',
        'f.trigger': '触发条件 trigger',
        'f.triggerHint': '事件的 trigger，一般由 on_action 触发时可以留空',
        'f.extra': '额外触发器',
        'f.extraHint': '可写 OR / NOT / has_advance 等，逐行缩进',
        'f.age': '时代',
        'f.icon': '图标',
        'f.iconHint': '留空使用默认；可填另一个革新的 ID 复用其图标',
        'f.requires': '接在哪些革新之后',
        'f.requiresHint': '输入革新中文名或 ID 搜索，点结果添加',
        'f.category': '分类',
        'f.estate': '阶层',
        'f.lawCategory': '法律分类',
        'f.effect': '效果 effect',
        'f.effectHint': '可交给 AI 生成，也可以自己补一句',
        'f.ai': 'AI 权重',
        'f.ns': '事件命名空间',
        'f.num': '事件编号',
        'f.eventType': '事件类型',
        'f.optionText': '选项文字',
        'f.permanent': '同时生成永久国家修正',
        'f.file': '建议文件',
        'm.search': '搜索修正（中文名或键名）',
        'm.searchHint': '留空即按分类列出全部；输入关键字可再筛选',
        'm.add': '添加修正',
        'm.empty': '还没有修正',
        'm.value': '数值',
        'm.remove': '删除',
        'm.all': '全部',
        'm.common': '常用',
        'm.hidden': '游戏内隐藏',
        'edit.toggle': '编辑已有条目',
        'edit.hint': '从 MOD 数据源里选一个条目直接改脚本；保存只替换这一条，文件里的其它内容原样保留。',
        'edit.search': '搜索条目（中文名或 ID）',
        'edit.empty': '没有可编辑的条目（原版目录只读，请在 MOD 里新建覆盖）',
        'edit.loading': '读取中…',
        'edit.save': '保存修改',
        'edit.saving': '保存中…',
        'edit.saved': '已保存',
        'edit.cancel': '取消',
        'edit.locSection': '本地化',
        'edit.locName': '名称',
        'edit.locDesc': '描述',
        'edit.locTitle': '标题',
        'edit.locOption': '选项',
        'edit.locMod': 'MOD 内',
        'edit.locOverride': '写入覆盖',
        'edit.locNew': '新建',
        'edit.locHint': '改过的文本会写回原来的本地化文件；原版文本或缺失的键会在当前 MOD 里新建覆盖条目。',
        'src.all': '来源：全部',
        'src.tab': '数据源',
        'src.title': '数据源',
        'src.hint': '默认包含原版与当前 MOD。可以再加入其它目录（联动 MOD、汉化、子 MOD）；添加后立即扫描，结果按来源分别统计。',
        'src.path': '目录路径',
        'src.kind': '类型',
        'src.game': '原版',
        'src.mod': 'MOD',
        'src.add': '添加并扫描',
        'src.remove': '移除',
        'src.rescan': '重新扫描',
        'src.counts': '{a} 革新 · {m} 修正 · {g} 时代 · {e} 阶层',
        'src.invalid': '无效路径：',
        'src.empty': '还没有数据源',
        'src.ages': '时代',
        'src.scanning': '扫描中…',
        'm.percent': '百分比',
        'm.bool': '开关',
        'm.none': '没有匹配的修正',
        'm.rawHint': '可填数字、5% 或脚本常量名',
        'm.count': '共 {n} 条 · 已显示 {m}',
        'm.more': '显示更多（还剩 {n} 条）',
        'm.mod': 'MOD',
        'm.vanilla': '原版',
        'cat.country': '国家',
        'cat.location': '地点',
        'cat.character': '角色',
        'cat.other': '其他',
        'cat.all': '全部',
        'u.kind': '类型',
        'u.target': '目标 ID',
        'u.add': '添加解锁',
        'p.add': '添加政策',
        'p.name': '政策',
        'p.remove': '删除政策',
        'c.record': '记入前置库',
        'c.recorded': '已记录',
        'c.mine': '工坊记录',
        'c.vanilla': '原版',
        'c.mod': '本 MOD',
        'out.script': '脚本',
        'out.loc': '本地化',
        'out.static': '静态修正',
        'out.copy': '复制',
        'out.copied': '已复制',
        'out.write': '写入 MOD',
        'out.writing': '写入中…',
        'out.written': '已写入 {n} 个文件',
        'out.writeFail': '写入失败',
        'out.empty': '填写脚本 ID 与名称后，这里会实时生成代码。',
        'out.bom': '写入时会自动补 UTF-8 BOM；setup 与 .gui 不要 BOM。',
        'out.root': 'MOD 目录',
        'out.targets': '选择写入位置',
        'out.scriptFile': '脚本文件',
        'out.locFile': '本地化文件',
        'out.newFile': '新建文件',
        'out.appendHint': '选已有文件则追加：脚本按 id 去重，本地化按 key 去重，不会覆盖原内容。',
        'out.fileName': '文件名',
        'out.browse': '浏览…',
        'out.browsing': '等待选择…',
        'out.picked': '已选择',
        'out.clearPick': '改回新建',
        'ai.prompt': '用中文描述触发条件与效果，例如：只有和平时期可用，花费 100 金币换 50 威望',
        'ai.run': 'AI 生成触发与效果',
        'ai.running': 'AI 正在写…',
        'ai.done': '已填入：',
        'ai.none': 'AI 没有返回可用字段',
        'ai.hint': '会用当前 profile 的默认模型，按名称、描述、TAG 和已选修正生成脚本。',
        'act.reset': '清空',
        'act.sample': '填入示例',
        'act.refresh': '重新扫描游戏数据',
        'err.id': '请先填写合法的脚本 ID',
        'load.title': '正在读取游戏与 MOD 数据…',
        'load.fail': '读取失败',
        'load.retry': '重试',
        'load.hint': '面板通过本机 Host 扫描游戏目录与当前 MOD，因此只显示这台机器上真实存在的革新与修正。',
        'data.mods': '修正 {n} 条',
        'data.adv': '革新 {n} 条',
        'data.customMods': '其中 MOD 自定义修正 {n} 条',
        'data.customAdv': 'MOD 自定义革新 {n} 条',
      },
      en: {
        'panel.title': 'PDX Forge',
        'panel.subtitle': 'Europa Universalis V · script generation',
        'game.eu5': 'Europa Universalis V',
        'game.more': 'Reserved',
        'soon.title': 'Generator interface reserved for this game',
        'soon.body': 'Games and content types are two layers: the Host scans this machine, while the panel only depends on one shared data shape. Adding another Paradox title means replacing the scanner and registering its data plus gen* templates.',
        'tab.advance': 'Advance',
        'tab.decision': 'Decision',
        'tab.event': 'Event',
        'tab.privilege': 'Privilege',
        'tab.law': 'Law',
        'sec.basic': 'Basics',
        'sec.ai': 'AI helper',
        'sec.trigger': 'Triggers',
        'sec.mods': 'Modifiers',
        'sec.unlock': 'Unlocks',
        'sec.option': 'Option and effect',
        'sec.policy': 'Policies',
        'f.id': 'Script ID',
        'f.idHint': 'Letters, digits, underscore; globally unique',
        'f.name': 'Name',
        'f.desc': 'Description',
        'f.descHint': 'Keep one space after a colour code, e.g. #R -30%#!',
        'f.tag': 'Country tag',
        'f.tagHint': 'Empty means every country',
        'f.potential': 'potential',
        'f.potentialHint': 'Describe it in the AI helper instead of writing script by hand',
        'f.allow': 'allow',
        'f.allowHint': 'Empty means always clickable',
        'f.trigger': 'trigger',
        'f.triggerHint': 'Event trigger; leave empty when an on_action fires it',
        'f.extra': 'Extra triggers',
        'f.extraHint': 'OR / NOT / has_advance ... one per line',
        'f.age': 'Age',
        'f.icon': 'Icon',
        'f.iconHint': 'Empty uses the default; another advance ID reuses its icon',
        'f.requires': 'Follows these advances',
        'f.requiresHint': 'Search by name or ID, then click a result',
        'f.category': 'Category',
        'f.estate': 'Estate',
        'f.lawCategory': 'Law category',
        'f.effect': 'effect',
        'f.effectHint': 'Let the AI draft it, or add one line yourself',
        'f.ai': 'AI weight',
        'f.ns': 'Event namespace',
        'f.num': 'Event number',
        'f.eventType': 'Event type',
        'f.optionText': 'Option text',
        'f.permanent': 'Also generate a permanent country modifier',
        'f.file': 'Suggested file',
        'm.search': 'Search modifiers (name or key)',
        'm.searchHint': 'Empty lists the whole category; type to narrow it',
        'm.add': 'Add modifier',
        'm.empty': 'No modifiers yet',
        'm.value': 'Value',
        'm.remove': 'Remove',
        'm.all': 'All',
        'm.common': 'Common',
        'm.hidden': 'hidden in game',
        'edit.toggle': 'Edit existing',
        'edit.hint': 'Pick an entry from a mod source and edit its script; saving replaces only that definition.',
        'edit.search': 'Search entries (name or ID)',
        'edit.empty': 'Nothing editable here (game sources are read-only; override it in the mod)',
        'edit.loading': 'Loading…',
        'edit.save': 'Save changes',
        'edit.saving': 'Saving…',
        'edit.saved': 'Saved',
        'edit.cancel': 'Cancel',
        'edit.locSection': 'Localisation',
        'edit.locName': 'Name',
        'edit.locDesc': 'Description',
        'edit.locTitle': 'Title',
        'edit.locOption': 'Option',
        'edit.locMod': 'in mod',
        'edit.locOverride': 'override',
        'edit.locNew': 'new',
        'edit.locHint': 'Changed text is written back to its localisation file; vanilla or missing keys get an override entry in the current mod.',
        'src.all': 'Source: all',
        'src.tab': 'Sources',
        'src.title': 'Data sources',
        'src.hint': 'The base game and the current mod are included by default. Add other folders (linked mods, translations, sub-mods); every addition rescans immediately and counts are reported per source.',
        'src.path': 'Folder',
        'src.kind': 'Kind',
        'src.game': 'Game',
        'src.mod': 'Mod',
        'src.add': 'Add and scan',
        'src.remove': 'Remove',
        'src.rescan': 'Rescan',
        'src.counts': '{a} advances · {m} modifiers · {g} ages · {e} estates',
        'src.invalid': 'Invalid path: ',
        'src.empty': 'No sources yet',
        'src.ages': 'Ages',
        'src.scanning': 'Scanning…',
        'm.percent': 'percent',
        'm.bool': 'toggle',
        'm.none': 'No matching modifier',
        'm.rawHint': 'Number, 5% or a script constant',
        'm.count': '{n} total · {m} shown',
        'm.more': 'Show more ({n} left)',
        'm.mod': 'MOD',
        'm.vanilla': 'Vanilla',
        'cat.country': 'Country',
        'cat.location': 'Location',
        'cat.character': 'Character',
        'cat.other': 'Other',
        'cat.all': 'All',
        'u.kind': 'Kind',
        'u.target': 'Target ID',
        'u.add': 'Add unlock',
        'p.add': 'Add policy',
        'p.name': 'Policy',
        'p.remove': 'Remove policy',
        'c.record': 'Save to prerequisite list',
        'c.recorded': 'Saved',
        'c.mine': 'Forge',
        'c.vanilla': 'Vanilla',
        'c.mod': 'This mod',
        'out.script': 'Script',
        'out.loc': 'Localisation',
        'out.static': 'Static modifier',
        'out.copy': 'Copy',
        'out.copied': 'Copied',
        'out.write': 'Write to mod',
        'out.writing': 'Writing…',
        'out.written': 'Wrote {n} file(s)',
        'out.writeFail': 'Write failed',
        'out.empty': 'Fill in a script ID and a name; code appears here live.',
        'out.bom': 'Writing adds the UTF-8 BOM; setup and .gui must not have one.',
        'out.root': 'Mod folder',
        'out.targets': 'Choose where to write',
        'out.scriptFile': 'Script file',
        'out.locFile': 'Localisation file',
        'out.newFile': 'New file',
        'out.appendHint': 'Picking an existing file appends: script blocks are de-duplicated by id, localisation by key.',
        'out.fileName': 'File name',
        'out.browse': 'Browse…',
        'out.browsing': 'Waiting for the dialog…',
        'out.picked': 'Picked',
        'out.clearPick': 'Use a new file',
        'ai.prompt': 'Describe triggers and effects in plain language',
        'ai.run': 'Draft triggers and effects',
        'ai.running': 'Asking the model…',
        'ai.done': 'Filled:',
        'ai.none': 'The model returned no usable field',
        'ai.hint': 'Uses the profile default model with the name, description, tag and picked modifiers.',
        'act.reset': 'Clear',
        'act.sample': 'Fill sample',
        'act.refresh': 'Rescan game data',
        'err.id': 'Enter a valid script ID first',
        'load.title': 'Reading game and mod data…',
        'load.fail': 'Could not read data',
        'load.retry': 'Retry',
        'load.hint': 'The panel asks the local Host to scan the game and the current mod, so it only lists advances and modifiers that exist on this machine.',
        'data.mods': '{n} modifiers',
        'data.adv': '{n} advances',
        'data.customMods': '{n} from this mod',
        'data.customAdv': '{n} advances from this mod',
      },
    }

    function applyI18n(locale) {
      if (!locale || typeof locale.register !== 'function') return () => {}
      const disposers = []
      for (const id of ['zh', 'en']) {
        try { disposers.push(locale.register(NS, id, I18N[id])) } catch (err) { /* already registered */ }
      }
      return () => { for (const d of disposers) try { d() } catch (err) {} }
    }

    function translator(ctx) {
      const cleanups = []
      let ready = false
      const dict = (key, vars) => {
        const locale = ctx && ctx.get ? ctx.get('locale') : undefined
        if (locale && !ready && typeof locale.register === 'function') {
          ready = true
          cleanups.push(applyI18n(locale))
        }
        let text = key
        if (locale && typeof locale.bind === 'function') {
          try { text = locale.bind(NS)(key) } catch (err) { text = I18N.zh[key] || key }
        } else {
          text = I18N.zh[key] || key
        }
        if (vars) for (const name of Object.keys(vars)) text = text.replace('{' + name + '}', String(vars[name]))
        return text
      }
      dict.dispose = () => { for (const fn of cleanups) try { fn() } catch (err) {} }
      return dict
    }

    /* --------------------------------------------------------------- helpers */
    const pad = (n) => '\t'.repeat(n)
    const nz = (s) => (s == null ? '' : String(s)).trim()
    const withTabs = (text, tabs) =>
      String(text)
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .map((line) => pad(tabs) + line)
        .join('\n')
    const block = (name, body, tabs) => `${pad(tabs)}${name} = {\n${withTabs(body, tabs + 1)}\n${pad(tabs)}}`
    const quote = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')
    const validId = (id) => /^[A-Za-z0-9_\-]+$/.test(nz(id))

    function modValue(mod, raw, idx) {
      const meta = idx && idx.modByKey.get(mod.key)
      let v = nz(raw)
      if (!v) v = meta && meta[2] === 2 ? 'yes' : '0'
      if (v.endsWith('%')) {
        const n = parseFloat(v.slice(0, -1))
        if (!Number.isNaN(n)) v = String(+(n / 100).toFixed(6))
      }
      return v
    }
    const modLines = (mods, idx) => mods.filter((m) => nz(m.key)).map((m) => `${m.key} = ${modValue(m, m.value, idx)}`)
    const hasMods = (mods) => mods.some((m) => nz(m.key))

    function triggerBody(f) {
      const parts = []
      if (nz(f.tag)) parts.push(`has_or_had_tag = ${nz(f.tag)}`)
      if (nz(f.potential)) parts.push(f.potential.trim())
      return parts.join('\n')
    }
    function locFile(entries) {
      const lines = entries.filter((x) => x && nz(x[1])).map((x) => ` ${x[0]}: "${quote(x[1])}"`)
      return `l_simp_chinese:\n${lines.join('\n')}\n`
    }

    function staticModifier(id, mods, idx) {
      if (!hasMods(mods)) return ''
      return `${id} = {\n${withTabs(`game_data = {\n${withTabs('category = country', 1)}\n}\n${modLines(mods, idx).join('\n')}`, 1)}\n}\n`
    }

    function addModifierEffect(id) {
      return `add_country_modifier = {\n\tmodifier = ${id}\n\tmonths = -1\n\tmode = add_and_extend\n}`
    }

    const lawCatKey = (cat, idx) => {
      const found = idx && idx.lawCats.find((c) => c.id === cat)
      return (found && found.key) || cat.toUpperCase() + '_LAW_CATEGORY'
    }

    /**
     * Map generated blocks onto the author's chosen destinations: a picked
     * existing document is appended to, otherwise the block's own path is used
     * (with an optional renamed file inside the same directory).
     */
    function buildWritePayload(blocks, targets) {
      const pick = (blk, chosen, name) => {
        if (chosen) return { path: chosen, text: blk.text, mode: 'append' }
        const dir = blk.path.replace(/\/[^/]+$/, '')
        const base = nz(name) || blk.path.split('/').pop()
        return { path: dir + '/' + base, text: blk.text, mode: 'replace' }
      }
      return (blocks || []).map((blk) => {
        if (blk.key === 'out.script') return pick(blk, targets.script, targets.scriptName)
        if (blk.key === 'out.loc') return pick(blk, targets.loc, targets.locName)
        return { path: blk.path, text: blk.text, mode: 'replace' }
      })
    }

    /* -------------------------------------------------------------- generate */
    function genAdvance(f, idx) {
      const id = nz(f.id)
      if (!validId(id)) return { error: 'err.id' }
      const body = [`age = ${f.age || 'age_1_traditions'}`]
      if (nz(f.icon)) body.push(`icon = ${nz(f.icon)}`)
      const trig = triggerBody(f)
      if (trig) body.push(block('potential', trig, 0))
      for (const r of f.requires) if (nz(r) && r !== id) body.push(`requires = ${nz(r)}`)
      for (const u of f.unlocks) if (nz(u.target)) body.push(`${u.kind} = ${nz(u.target)}`)
      body.push(...modLines(f.mods, idx))
      const script = `${id} = {\n${withTabs(body.join('\n'), 1)}\n}\n`
      const loc = locFile([[id, f.name], [`${id}_desc`, f.desc]])
      return {
        blocks: [
          { key: 'out.script', path: `in_game/common/advances/${id}.txt`, text: script },
          { key: 'out.loc', path: `in_game/localization/simp_chinese/${id}_l_simp_chinese.yml`, text: loc },
        ],
      }
    }

    function genDecision(f, idx) {
      const id = nz(f.id)
      if (!validId(id)) return { error: 'err.id' }
      const body = [`decision_category = ${f.category}`]
      const trig = triggerBody(f)
      if (trig) body.push(block('potential', trig, 0))
      if (nz(f.allow)) body.push(block('allow', f.allow, 0))
      body.push(block('ai_will_do', `value = ${nz(f.ai) || '100'}`, 0))
      const effect = []
      if (nz(f.effect)) effect.push(f.effect.trim())
      if (hasMods(f.mods)) effect.push(addModifierEffect(`${id}_modifier`))
      const option = [`name = ${id}.a`, 'ai_chance = { value = 100 }']
      if (effect.length) option.push(block('effect', effect.join('\n'), 0))
      body.push(block('option', option.join('\n'), 0))
      const blocks = [
        { key: 'out.script', path: `in_game/common/decisions/${id}.txt`, text: `${id} = {\n${withTabs(body.join('\n'), 1)}\n}\n` },
      ]
      if (hasMods(f.mods)) {
        blocks.push({ key: 'out.static', path: `main_menu/common/static_modifiers/${id}_modifier.txt`, text: staticModifier(`${id}_modifier`, f.mods, idx) })
      }
      blocks.push({
        key: 'out.loc',
        path: `in_game/localization/simp_chinese/${id}_l_simp_chinese.yml`,
        text: locFile([
          [`${id}.title`, f.name],
          [`${id}.desc`, f.desc],
          [`${id}.a`, f.option || '确认'],
          ...(hasMods(f.mods) ? [[`STATIC_MODIFIER_NAME_${id}_modifier`, f.name], [`STATIC_MODIFIER_DESC_${id}_modifier`, f.desc]] : []),
        ]),
      })
      return { blocks }
    }

    function genEvent(f, idx) {
      const ns = nz(f.ns) || nz(f.id)
      if (!validId(ns)) return { error: 'err.id' }
      const num = Math.max(1, parseInt(f.num, 10) || 1)
      const key = `${ns}.${num}`
      const body = [`type = ${f.type}`, `title = ${key}.title`, `desc = ${key}.desc`]
      if (nz(f.trigger)) body.push(block('trigger', f.trigger.trim(), 0))
      const effect = []
      if (nz(f.effect)) effect.push(f.effect.trim())
      if (hasMods(f.mods)) effect.push(addModifierEffect(`${ns}_${num}_modifier`))
      const option = [`name = ${key}.a`]
      if (effect.length) option.push(effect.join('\n'))
      body.push(block('option', option.join('\n'), 0))
      const blocks = [
        { key: 'out.script', path: `in_game/events/${ns}.txt`, text: `namespace = ${ns}\n\n${key} = {\n${withTabs(body.join('\n'), 1)}\n}\n` },
      ]
      if (hasMods(f.mods)) {
        blocks.push({ key: 'out.static', path: `main_menu/common/static_modifiers/${ns}_${num}_modifier.txt`, text: staticModifier(`${ns}_${num}_modifier`, f.mods, idx) })
      }
      blocks.push({
        key: 'out.loc',
        path: `in_game/localization/simp_chinese/${ns}_l_simp_chinese.yml`,
        text: locFile([
          [`${key}.title`, f.title || f.name],
          [`${key}.desc`, f.desc],
          [`${key}.a`, f.option || '确认'],
          ...(hasMods(f.mods) ? [[`STATIC_MODIFIER_NAME_${ns}_${num}_modifier`, f.title || f.name], [`STATIC_MODIFIER_DESC_${ns}_${num}_modifier`, f.desc]] : []),
        ]),
      })
      return { blocks }
    }

    function genPrivilege(f, idx) {
      const id = nz(f.id)
      if (!validId(id)) return { error: 'err.id' }
      const body = [`estate = ${f.estate}`]
      const trig = triggerBody(f)
      if (trig) body.push(block('potential', trig, 0))
      if (nz(f.allow)) body.push(block('allow', f.allow, 0))
      if (hasMods(f.mods)) body.push(block('country_modifier', modLines(f.mods, idx).join('\n'), 0))
      return {
        blocks: [
          { key: 'out.script', path: `in_game/common/estate_privileges/${id}.txt`, text: `${id} = {\n${withTabs(body.join('\n'), 1)}\n}\n` },
          { key: 'out.loc', path: `in_game/localization/simp_chinese/${id}_l_simp_chinese.yml`, text: locFile([[id, f.name], [`${id}_desc`, f.desc]]) },
        ],
      }
    }

    function genLaw(f, idx) {
      const id = nz(f.id)
      if (!validId(id)) return { error: 'err.id' }
      const body = [`law_category = ${f.category}`]
      const trig = triggerBody(f)
      if (trig) body.push(block('potential', trig, 0))
      if (nz(f.allow)) body.push(block('allow', f.allow, 0))
      const loc = [[id, f.name], [`${id}_desc`, f.desc], [`${id}_CATEGORY`, lawCatKey(f.category, idx)]]
      for (const p of f.policies) {
        const pid = nz(p.id)
        if (!validId(pid)) continue
        const inner = []
        if (hasMods(p.mods)) inner.push(block('country_modifier', modLines(p.mods, idx).join('\n'), 0))
        inner.push('years = 2')
        body.push(block(pid, inner.join('\n'), 0))
        loc.push([pid, p.name], [`${pid}_desc`, p.desc])
      }
      return {
        blocks: [
          { key: 'out.script', path: `in_game/common/laws/${id}.txt`, text: `${id} = {\n${withTabs(body.join('\n'), 1)}\n}\n` },
          { key: 'out.loc', path: `in_game/localization/simp_chinese/${id}_l_simp_chinese.yml`, text: locFile(loc) },
        ],
      }
    }

    const GENERATORS = { advance: genAdvance, decision: genDecision, event: genEvent, privilege: genPrivilege, law: genLaw }

    /* --------------------------------------------------------------- storage */
    function loadState() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : null
      } catch (err) { return null }
    }
    function saveState(state) {
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)) } catch (err) { /* quota */ }
    }

    /* ------------------------------------------------------------- data index */
    function makeIndex(data) {
      const modByKey = new Map()
      for (const m of data.modifiers) modByKey.set(m[0], m)
      const advById = new Map()
      for (const a of data.advances) advById.set(a[0], a)
      const rank = new Map()
      data.meta.commonModifiers.forEach((k, i) => rank.set(k, i))
      const modsByCat = new Map()
      for (const m of data.modifiers) {
        const list = modsByCat.get(m[3]) || []
        list.push(m)
        modsByCat.set(m[3], list)
      }
      for (const list of modsByCat.values()) {
        list.sort((a, b) => {
          const ra = rank.has(a[0]) ? rank.get(a[0]) : 999
          const rb = rank.has(b[0]) ? rank.get(b[0]) : 999
          if (ra !== rb) return ra - rb
          return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
        })
      }
      return {
        data,
        modByKey,
        advById,
        modsByCat,
        rank,
        lawCats: data.meta.lawCategories,
        lawCatLabel: (id) => {
          const found = data.meta.lawCategories.find((c) => c.id === id)
          return (found && found.label) || id
        },
      }
    }

    /* ------------------------------------------------------------ components */
    const ForgeCtx = React.createContext(null)
    const useForge = () => React.useContext(ForgeCtx)

    function useLocaleTick(ctx) {
      const [, force] = useState(0)
      useEffect(() => {
        const locale = ctx && ctx.get ? ctx.get('locale') : undefined
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(() => force((x) => x + 1))
      }, [ctx])
    }

    function Label({ children }) {
      return e('span', { className: 'pf-label' }, children)
    }

    function Field({ label, hint, children }) {
      return e('div', { className: 'pf-field' }, e(Label, null, label), children, hint ? e('span', { className: 'pf-hint' }, hint) : null)
    }

    function TextInput({ value, onChange, placeholder, mono, type }) {
      return e('input', {
        className: 'pf-input' + (mono ? ' pf-mono' : ''),
        type: type || 'text',
        value: value == null ? '' : value,
        placeholder,
        spellCheck: false,
        onChange: (ev) => onChange(ev.target.value),
      })
    }

    function TextArea({ value, onChange, rows, placeholder, mono }) {
      return e('textarea', {
        className: 'pf-area' + (mono ? ' pf-mono' : ''),
        value: value == null ? '' : value,
        rows: rows || 3,
        placeholder,
        spellCheck: false,
        onChange: (ev) => onChange(ev.target.value),
      })
    }

    function Select({ value, onChange, options }) {
      return e(
        'select',
        { className: 'pf-select', value, onChange: (ev) => onChange(ev.target.value) },
        options.map((o) => e('option', { key: o.value, value: o.value }, o.label)),
      )
    }

    function Btn({ children, onClick, kind, title, disabled }) {
      return e('button', {
        type: 'button',
        className: 'pf-btn' + (kind ? ' pf-btn-' + kind : ''),
        title,
        disabled: !!disabled,
        onClick,
      }, children)
    }

    function Badge({ children, tone }) {
      return e('span', { className: 'pf-badge' + (tone ? ' pf-badge-' + tone : '') }, children)
    }

    /* ---------------------------------------------------------------- pickers */
    const PAGE = 120
    const TOPIC_MIN = 40

    // Browsing groups. Character/other stay flat (too few entries to split);
    // country/location are bucketed by topic, and only buckets big enough to
    // stand on their own are offered as sub-categories.
    const GROUPS = [
      { id: 'country', key: 'cat.country', scopes: ['country', 'unit', 'mercenary'], topics: true },
      { id: 'location', key: 'cat.location', scopes: ['location', 'province'], topics: true },
      { id: 'character', key: 'cat.character', scopes: ['character', 'dynasty'], topics: false },
      { id: 'other', key: 'cat.other', scopes: ['religion', 'internationalorganization', 'rebel', 'none', 'all', 'movement'], topics: false },
    ]

    const TOPIC_RULES = [
      ['topic.estate', /estate|crown|nobles|clergy|burghers|peasants|dhimmi|cossack|tribe|satisfaction|privilege/],
      ['topic.military', /army|navy|naval|military|morale|discipline|manpower|sailor|levy|regiment|ship|fort|garrison|combat|siege|admiral|general|attrition|supply|logistic|experience|tradition|mercenar|artillery|cavalry|infantry|militia|blockade|privateer/],
      ['topic.economy', /tax|gold|income|expense|cost|price|loan|interest|inflation|bank|budget|treasury|trade|merchant|market|production|goods|industr|rgo|build|develop|prosperity|devastation|colon|invest|profit|tariff|custom/],
      ['topic.diplomacy', /diplomat|relation|opinion|trust|prestige|reputation|warscore|truce|vassal|subject|integr|annex|claim|casus|alliance|marriage|espionage|spy|aggressive_expansion|great_power/],
      ['topic.admin', /administrat|cabinet|bureaucra|govern|control|unrest|stability|legitimacy|republican|devotion|influence|reform|law|policy|court|ruler|heir|succession|centraliz|autonom|absolut|parliament|vote|election|governance/],
      ['topic.culture', /culture|cultural|religion|religious|church|literacy|institution|innovat|artist|art_|language|convert|tolerance|education|universit|school|movement|humanist/],
    ]

    const topicOf = (id) => {
      for (const [key, re] of TOPIC_RULES) if (re.test(id)) return key
      return 'topic.other'
    }

    function useSourceLabel() {
      const { sources } = useForge()
      return (index) => {
        if (index === -1) return null
        const found = (sources || [])[index]
        return found ? found.label : 'MOD'
      }
    }

    function ModifierPicker({ t, onPick }) {
      const { idx, sources } = useForge()
      const [q, setQ] = useState('')
      const [group, setGroup] = useState('country')
      const [sub, setSub] = useState('all')
      const [src, setSrc] = useState('all')
      const [limit, setLimit] = useState(PAGE)
      const sourceLabel = useSourceLabel()

      const groupDef = GROUPS.find((g) => g.id === group) || null

      const scopePool = useMemo(() => {
        const rank = idx.rank
        const list = idx.data.modifiers.filter((m) => {
          if (groupDef && !groupDef.scopes.includes(m[3])) return false
          if (src !== 'all' && m[5] !== Number(src)) return false
          return true
        })
        return list.sort((a, b) => {
          const ra = rank.has(a[0]) ? rank.get(a[0]) : 999
          const rb = rank.has(b[0]) ? rank.get(b[0]) : 999
          if (ra !== rb) return ra - rb
          return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
        })
      }, [idx, groupDef, src])

      const topicCounts = useMemo(() => {
        const counts = new Map()
        if (!groupDef || !groupDef.topics) return counts
        for (const m of scopePool) {
          const key = topicOf(m[0])
          counts.set(key, (counts.get(key) || 0) + 1)
        }
        return counts
      }, [scopePool, groupDef])

      const subOptions = useMemo(() => {
        if (!groupDef || !groupDef.topics) return []
        const out = [{ value: 'all', label: t('cat.all') }]
        for (const [key] of TOPIC_RULES) if ((topicCounts.get(key) || 0) >= TOPIC_MIN) out.push({ value: key, label: t(key) })
        if ((topicCounts.get('topic.other') || 0) >= TOPIC_MIN) out.push({ value: 'topic.other', label: t('topic.other') })
        return out
      }, [groupDef, topicCounts, t])

      const filtered = useMemo(() => {
        let list = scopePool
        if (groupDef && groupDef.topics && sub !== 'all') list = list.filter((m) => topicOf(m[0]) === sub)
        const query = q.trim().toLowerCase()
        if (!query) return list
        return list.filter((m) => m[0].toLowerCase().includes(query) || (m[1] && m[1].toLowerCase().includes(query)))
      }, [scopePool, q, sub, groupDef])

      useEffect(() => { setLimit(PAGE) }, [q, group, sub, src])
      useEffect(() => { setSub('all') }, [group, src])

      const visible = filtered.slice(0, limit)
      const groupOptions = [{ value: 'all', label: t('cat.all') }].concat(GROUPS.map((g) => ({ value: g.id, label: t(g.key) })))
      const srcOptions = [{ value: 'all', label: t('src.all') }].concat(
        (sources || []).filter((s) => s.ok).map((s) => ({ value: String(s.index), label: s.label })),
      )
      const usableSources = (sources || []).filter((s) => s.ok)

      return e(
        'div',
        { className: 'pf-picker' },
        e(
          'div',
          { className: 'pf-row' },
          e(TextInput, { value: q, onChange: setQ, placeholder: t('m.search') }),
          e('div', { className: 'pf-cat' }, e(Select, { value: group, onChange: setGroup, options: groupOptions })),
          subOptions.length > 1
            ? e('div', { className: 'pf-cat pf-cat-sm' }, e(Select, { value: sub, onChange: setSub, options: subOptions }))
            : null,
        ),
        e(
          'div',
          { className: 'pf-meta-row' },
          e('div', { className: 'pf-count' }, t('m.count', { n: filtered.length, m: visible.length })),
          usableSources.length > 1
            ? e('div', { className: 'pf-src' }, e(Select, { value: src, onChange: setSrc, options: srcOptions }))
            : null,
        ),
        e(
          'div',
          { className: 'pf-results' },
          visible.length === 0
            ? e('div', { className: 'pf-empty' }, t('m.none'))
            : visible.map((m) =>
                e(
                  'button',
                  { type: 'button', key: m[0], className: 'pf-result', onClick: () => onPick(m[0]) },
                  e('span', { className: 'pf-res-name' }, m[1] || m[0]),
                  e('code', { className: 'pf-res-key' }, m[0]),
                  m[5] > 0 ? e(Badge, { tone: 'mod' }, sourceLabel(m[5])) : null,
                  m[4] === 1 ? e(Badge, null, t('m.hidden')) : null,
                  m[2] === 2 ? e(Badge, { tone: 'bool' }, t('m.bool')) : m[2] === 1 ? e(Badge, { tone: 'pct' }, t('m.percent')) : null,
                ),
              ),
        ),
        filtered.length > visible.length
          ? e(Btn, { kind: 'ghost', onClick: () => setLimit(limit + PAGE * 2) }, t('m.more', { n: filtered.length - visible.length }))
          : null,
        e('span', { className: 'pf-hint' }, t('m.searchHint')),
      )
    }

    function AdvancePicker({ t, selected, onChange, custom, onRecord, recorded }) {
      const { idx, sources } = useForge()
      const [q, setQ] = useState('')
      const [src, setSrc] = useState('all')
      const [limit, setLimit] = useState(PAGE)
      const sourceLabel = useSourceLabel()

      const filtered = useMemo(() => {
        const query = q.trim().toLowerCase()
        const customRows = custom.map((c) => [c.id, c.name || c.id, -1])
        const inSource = (a) => src === 'all' || a[2] === Number(src)
        if (!query) {
          const modFirst = idx.data.advances.filter((a) => a[2] > 0 && inSource(a))
          return customRows.concat(modFirst)
        }
        const out = []
        for (const c of custom) {
          if (c.id.toLowerCase().includes(query) || (c.name || '').toLowerCase().includes(query)) out.push([c.id, c.name || c.id, -1])
        }
        for (const a of idx.data.advances) {
          if (selected.includes(a[0]) || !inSource(a)) continue
          if (a[0].toLowerCase().includes(query) || (a[1] && a[1].toLowerCase().includes(query))) out.push(a)
          if (out.length > 400) break
        }
        return out
      }, [idx, q, custom, selected, src])

      useEffect(() => { setLimit(PAGE) }, [q, src])

      const visible = filtered.slice(0, limit)
      const srcOptions = [{ value: 'all', label: t('src.all') }].concat(
        (sources || []).filter((s) => s.ok).map((s) => ({ value: String(s.index), label: s.label })),
      )
      const usableSources = (sources || []).filter((s) => s.ok)

      return e(
        'div',
        { className: 'pf-picker' },
        selected.length
          ? e(
              'div',
              { className: 'pf-chips' },
              selected.map((id) => {
                const meta = idx.advById.get(id)
                return e(
                  'span',
                  { className: 'pf-chip', key: id },
                  e('span', null, meta ? meta[1] : id),
                  e('code', { className: 'pf-chip-key' }, id),
                  e('button', { type: 'button', className: 'pf-chip-x', onClick: () => onChange(selected.filter((x) => x !== id)) }, '×'),
                )
              }),
            )
          : null,
        e(TextInput, { value: q, onChange: setQ, placeholder: t('f.requiresHint') }),
        usableSources.length > 1
          ? e(
              'div',
              { className: 'pf-meta-row' },
              e('div', { className: 'pf-count' }, t('m.count', { n: filtered.length, m: visible.length })),
              e('div', { className: 'pf-src' }, e(Select, { value: src, onChange: setSrc, options: srcOptions })),
            )
          : null,
        e(
          'div',
          { className: 'pf-results' },
          visible.length === 0
            ? e(
                'button',
                {
                  type: 'button',
                  className: 'pf-result',
                  disabled: !validId(q.trim()),
                  onClick: () => { if (validId(q.trim())) { onChange(selected.concat([q.trim()])); setQ('') } },
                },
                e('span', { className: 'pf-res-name' }, `${t('f.requires')}: ${q.trim() || '—'}`),
                e('code', { className: 'pf-res-key' }, validId(q.trim()) ? 'free id' : 'invalid id'),
              )
            : visible.map((a) =>
                e(
                  'button',
                  {
                    type: 'button',
                    key: a[0],
                    className: 'pf-result',
                    onClick: () => { if (!selected.includes(a[0])) onChange(selected.concat([a[0]])); setQ('') },
                  },
                  e('span', { className: 'pf-res-name' }, a[1] || a[0]),
                  e('code', { className: 'pf-res-key' }, a[0]),
                  e(Badge, { tone: a[2] >= 0 ? (a[2] === 0 ? null : 'mod') : null }, a[2] === -1 ? t('c.mine') : sourceLabel(a[2])),
                ),
              ),
        ),
        filtered.length > visible.length
          ? e(Btn, { kind: 'ghost', onClick: () => setLimit(limit + PAGE * 2) }, t('m.more', { n: filtered.length - visible.length }))
          : null,
        e(Btn, { kind: 'ghost', onClick: onRecord, title: t('c.record') }, recorded ? t('c.recorded') : t('c.record')),
      )
    }

    /* ----------------------------------------------------------------- forms */
    function ModEditor({ t, mods, onChange }) {
      const { idx } = useForge()
      const add = (key) => {
        if (!key || mods.some((m) => m.key === key)) return
        onChange(mods.concat([{ key, value: '' }]))
      }
      const update = (i, patch) => onChange(mods.map((m, k) => (k === i ? { ...m, ...patch } : m)))
      const remove = (i) => onChange(mods.filter((_, k) => k !== i))
      return e(
        'div',
        { className: 'pf-mods' },
        mods.length === 0
          ? e('div', { className: 'pf-empty' }, t('m.empty'))
          : mods.map((m, i) => {
              const meta = idx.modByKey.get(m.key)
              const kind = meta ? meta[2] : 0
              return e(
                'div',
                { className: 'pf-mod-row', key: m.key },
                e(
                  'div',
                  { className: 'pf-mod-info' },
                  e('span', { className: 'pf-mod-name' }, (meta && meta[1]) || m.key),
                  e('code', { className: 'pf-mod-key' }, m.key),
                  meta && meta[5] === 1 ? e(Badge, { tone: 'mod' }, t('m.mod')) : null,
                  meta && meta[4] === 1 ? e(Badge, null, t('m.hidden')) : null,
                  kind === 2 ? e(Badge, { tone: 'bool' }, t('m.bool')) : kind === 1 ? e(Badge, { tone: 'pct' }, t('m.percent')) : null,
                ),
                e(TextInput, {
                  value: m.value,
                  mono: true,
                  placeholder: kind === 2 ? 'yes / no' : kind === 1 ? '0.05 / 5%' : '1 / -0.1',
                  onChange: (v) => update(i, { value: v }),
                }),
                e(Btn, { kind: 'ghost', onClick: () => remove(i), title: t('m.remove') }, '×'),
              )
            }),
        e(ModifierPicker, { t, onPick: add }),
        e('span', { className: 'pf-hint' }, t('m.rawHint')),
      )
    }

    function AiBlock({ t, type, form, onFill }) {
      const [text, setText] = useState('')
      const [busy, setBusy] = useState(false)
      const [msg, setMsg] = useState('')
      const run = async () => {
        setBusy(true)
        setMsg('')
        try {
          const fieldsByType = {
            advance: ['potential'],
            decision: ['potential', 'allow', 'effect', 'option'],
            event: ['trigger', 'effect', 'option'],
            privilege: ['potential', 'allow'],
            law: ['potential', 'allow'],
          }
          const fields = fieldsByType[type] || ['potential']
          const res = await fetch('/pdx-forge/ai', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              type,
              typeLabel: t('tab.' + type),
              name: form.name || form.title || '',
              desc: form.desc || '',
              tag: form.tag || '',
              fields,
              instruction: text,
              modifiers: (form.mods || []).filter((m) => nz(m.key)).map((m) => `${m.key} = ${modValue(m, m.value, null)}`),
            }),
          })
          const json = await res.json()
          if (!json.ok) throw new Error(json.error || 'AI failed')
          const filled = onFill(json.fields || {})
          setMsg(filled.length ? t('ai.done') + ' ' + filled.join(' / ') : t('ai.none'))
        } catch (err) {
          setMsg(String(err && err.message ? err.message : err))
        } finally {
          setBusy(false)
        }
      }
      return e(
        'div',
        { className: 'pf-sec' },
        e('div', { className: 'pf-sec-h' }, t('sec.ai')),
        e(TextArea, { value: text, onChange: setText, rows: 2, placeholder: t('ai.prompt') }),
        e(
          'div',
          { className: 'pf-row' },
          e(Btn, { kind: 'primary', onClick: run, disabled: busy }, busy ? t('ai.running') : t('ai.run')),
          msg ? e('span', { className: 'pf-hint pf-msg' }, msg) : e('span', { className: 'pf-hint' }, t('ai.hint')),
        ),
      )
    }

    function AdvanceForm({ t, f, set, applyAi }) {
      const [recorded, setRecorded] = useState(false)
      const { idx, data, customAdvances } = useForge()
      const record = () => {
        if (!validId(f.id)) return
        window.dispatchEvent(new CustomEvent('pdx-forge:record', { detail: { id: nz(f.id), name: nz(f.name) } }))
        setRecorded(true)
        setTimeout(() => setRecorded(false), 1200)
      }
      return e(
        React.Fragment,
        null,
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.basic')),
          e(Field, { label: t('f.id'), hint: t('f.idHint') }, e(TextInput, { value: f.id, mono: true, placeholder: 'example_advance', onChange: (v) => set({ id: v }) })),
          e(Field, { label: t('f.name') }, e(TextInput, { value: f.name, placeholder: '示例革新', onChange: (v) => set({ name: v }) })),
          e(Field, { label: t('f.desc'), hint: t('f.descHint') }, e(TextArea, { value: f.desc, rows: 3, onChange: (v) => set({ desc: v }) })),
          e(
            'div',
            { className: 'pf-row' },
            e(Field, { label: t('f.age') }, e(Select, { value: f.age, onChange: (v) => set({ age: v }), options: data.meta.ages.map((a) => ({ value: a.id, label: a.label })) })),
            e(Field, { label: t('f.icon'), hint: t('f.iconHint') }, e(TextInput, { value: f.icon, mono: true, placeholder: 'icon', onChange: (v) => set({ icon: v }) })),
          ),
        ),
        e(AiBlock, { t, type: 'advance', form: f, onFill: applyAi }),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('f.requires')),
          e(AdvancePicker, { t, selected: f.requires, onChange: (v) => set({ requires: v }), custom: customAdvances || [], onRecord: record, recorded }),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.trigger')),
          e(Field, { label: t('f.tag'), hint: t('f.tagHint') }, e(TextInput, { value: f.tag, mono: true, placeholder: 'BA2', onChange: (v) => set({ tag: v }) })),
          e(Field, { label: t('f.potential'), hint: t('f.potentialHint') }, e(TextArea, { value: f.potential, rows: 3, mono: true, onChange: (v) => set({ potential: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.unlock')),
          f.unlocks.length === 0 ? null : f.unlocks.map((u, i) =>
            e(
              'div',
              { className: 'pf-row', key: 'u' + i },
              e(Select, {
                value: u.kind,
                onChange: (v) => set({ unlocks: f.unlocks.map((x, k) => (k === i ? { ...x, kind: v } : x)) }),
                options: data.meta.unlockKinds.map((k) => ({ value: k.id, label: k.label })),
              }),
              e(TextInput, {
                value: u.target,
                mono: true,
                placeholder: 'target_id',
                onChange: (v) => set({ unlocks: f.unlocks.map((x, k) => (k === i ? { ...x, target: v } : x)) }),
              }),
              e(Btn, { kind: 'ghost', onClick: () => set({ unlocks: f.unlocks.filter((_, k) => k !== i) }) }, '×'),
            ),
          ),
          e(Btn, { kind: 'ghost', onClick: () => set({ unlocks: f.unlocks.concat([{ kind: 'unlock_building', target: '' }]) }) }, t('u.add')),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.mods')),
          e(ModEditor, { t, mods: f.mods, onChange: (v) => set({ mods: v }) }),
        ),
      )
    }

    function DecisionForm({ t, f, set, applyAi }) {
      const { data } = useForge()
      return e(
        React.Fragment,
        null,
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.basic')),
          e(Field, { label: t('f.id'), hint: t('f.idHint') }, e(TextInput, { value: f.id, mono: true, placeholder: 'example_decision', onChange: (v) => set({ id: v }) })),
          e(Field, { label: t('f.name') }, e(TextInput, { value: f.name, onChange: (v) => set({ name: v }) })),
          e(Field, { label: t('f.desc'), hint: t('f.descHint') }, e(TextArea, { value: f.desc, rows: 3, onChange: (v) => set({ desc: v }) })),
          e(Field, { label: t('f.category') }, e(Select, {
            value: f.category,
            onChange: (v) => set({ category: v }),
            options: data.meta.decisionCategories.map((c) => ({ value: c.id, label: c.label })),
          })),
        ),
        e(AiBlock, { t, type: 'decision', form: f, onFill: applyAi }),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.trigger')),
          e(Field, { label: t('f.tag'), hint: t('f.tagHint') }, e(TextInput, { value: f.tag, mono: true, onChange: (v) => set({ tag: v }) })),
          e(Field, { label: t('f.potential'), hint: t('f.potentialHint') }, e(TextArea, { value: f.potential, rows: 3, mono: true, onChange: (v) => set({ potential: v }) })),
          e(Field, { label: t('f.allow'), hint: t('f.allowHint') }, e(TextArea, { value: f.allow, rows: 2, mono: true, placeholder: 'at_war = no', onChange: (v) => set({ allow: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.option')),
          e(Field, { label: t('f.effect'), hint: t('f.effectHint') }, e(TextArea, { value: f.effect, rows: 3, mono: true, placeholder: 'add_gold = 100', onChange: (v) => set({ effect: v }) })),
          e(Field, { label: t('f.optionText') }, e(TextInput, { value: f.option, placeholder: '确认', onChange: (v) => set({ option: v }) })),
          e(Field, { label: t('f.ai') }, e(TextInput, { value: f.ai, mono: true, onChange: (v) => set({ ai: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.mods')),
          e(ModEditor, { t, mods: f.mods, onChange: (v) => set({ mods: v }) }),
        ),
      )
    }

    function EventForm({ t, f, set, applyAi }) {
      const { data } = useForge()
      return e(
        React.Fragment,
        null,
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.basic')),
          e(
            'div',
            { className: 'pf-row' },
            e(Field, { label: t('f.ns'), hint: t('f.idHint') }, e(TextInput, { value: f.ns, mono: true, placeholder: 'example_events', onChange: (v) => set({ ns: v }) })),
            e(Field, { label: t('f.num') }, e(TextInput, { value: f.num, mono: true, onChange: (v) => set({ num: v }) })),
          ),
          e(Field, { label: t('f.eventType') }, e(Select, { value: f.type, onChange: (v) => set({ type: v }), options: data.meta.eventTypes.map((k) => ({ value: k.id, label: k.label })) })),
          e(Field, { label: t('f.name') }, e(TextInput, { value: f.title, onChange: (v) => set({ title: v }) })),
          e(Field, { label: t('f.desc'), hint: t('f.descHint') }, e(TextArea, { value: f.desc, rows: 3, onChange: (v) => set({ desc: v }) })),
        ),
        e(AiBlock, { t, type: 'event', form: f, onFill: applyAi }),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.trigger')),
          e(Field, { label: t('f.trigger'), hint: t('f.triggerHint') }, e(TextArea, { value: f.trigger, rows: 2, mono: true, onChange: (v) => set({ trigger: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.option')),
          e(Field, { label: t('f.optionText') }, e(TextInput, { value: f.option, placeholder: '确认', onChange: (v) => set({ option: v }) })),
          e(Field, { label: t('f.effect'), hint: t('f.effectHint') }, e(TextArea, { value: f.effect, rows: 3, mono: true, onChange: (v) => set({ effect: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.mods')),
          e(ModEditor, { t, mods: f.mods, onChange: (v) => set({ mods: v }) }),
        ),
      )
    }

    function PrivilegeForm({ t, f, set, applyAi }) {
      const { data } = useForge()
      return e(
        React.Fragment,
        null,
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.basic')),
          e(Field, { label: t('f.id'), hint: t('f.idHint') }, e(TextInput, { value: f.id, mono: true, placeholder: 'example_privilege', onChange: (v) => set({ id: v }) })),
          e(Field, { label: t('f.name') }, e(TextInput, { value: f.name, onChange: (v) => set({ name: v }) })),
          e(Field, { label: t('f.desc'), hint: t('f.descHint') }, e(TextArea, { value: f.desc, rows: 3, onChange: (v) => set({ desc: v }) })),
          e(Field, { label: t('f.estate') }, e(Select, {
            value: f.estate,
            onChange: (v) => set({ estate: v }),
            options: data.meta.estates.map((st) => ({ value: st.id, label: st.label })),
          })),
        ),
        e(AiBlock, { t, type: 'privilege', form: f, onFill: applyAi }),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.trigger')),
          e(Field, { label: t('f.tag'), hint: t('f.tagHint') }, e(TextInput, { value: f.tag, mono: true, onChange: (v) => set({ tag: v }) })),
          e(Field, { label: t('f.potential'), hint: t('f.potentialHint') }, e(TextArea, { value: f.potential, rows: 2, mono: true, onChange: (v) => set({ potential: v }) })),
          e(Field, { label: t('f.allow'), hint: t('f.allowHint') }, e(TextArea, { value: f.allow, rows: 2, mono: true, onChange: (v) => set({ allow: v }) })),
        ),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.mods')),
          e(ModEditor, { t, mods: f.mods, onChange: (v) => set({ mods: v }) }),
        ),
      )
    }

    function blankPolicy() { return { id: '', name: '', desc: '', mods: [] } }

    function LawForm({ t, f, set, applyAi }) {
      const { data } = useForge()
      const setPolicy = (i, patch) => set({ policies: f.policies.map((p, k) => (k === i ? { ...p, ...patch } : p)) })
      return e(
        React.Fragment,
        null,
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.basic')),
          e(Field, { label: t('f.id'), hint: t('f.idHint') }, e(TextInput, { value: f.id, mono: true, placeholder: 'example_law', onChange: (v) => set({ id: v }) })),
          e(Field, { label: t('f.name') }, e(TextInput, { value: f.name, onChange: (v) => set({ name: v }) })),
          e(Field, { label: t('f.desc'), hint: t('f.descHint') }, e(TextArea, { value: f.desc, rows: 2, onChange: (v) => set({ desc: v }) })),
          e(Field, { label: t('f.lawCategory') }, e(Select, {
            value: f.category,
            onChange: (v) => set({ category: v }),
            options: data.meta.lawCategories.map((c) => ({ value: c.id, label: c.label })),
          })),
        ),
        e(AiBlock, { t, type: 'law', form: f, onFill: applyAi }),
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('sec.trigger')),
          e(Field, { label: t('f.tag'), hint: t('f.tagHint') }, e(TextInput, { value: f.tag, mono: true, onChange: (v) => set({ tag: v }) })),
          e(Field, { label: t('f.potential'), hint: t('f.potentialHint') }, e(TextArea, { value: f.potential, rows: 2, mono: true, onChange: (v) => set({ potential: v }) })),
          e(Field, { label: t('f.allow'), hint: t('f.allowHint') }, e(TextArea, { value: f.allow, rows: 2, mono: true, onChange: (v) => set({ allow: v }) })),
        ),
        f.policies.map((p, i) =>
          e(
            'div',
            { className: 'pf-sec', key: 'p' + i },
            e(
              'div',
              { className: 'pf-sec-h' },
              `${t('p.name')} ${i + 1}`,
              e('span', { className: 'pf-spacer' }),
              e(Btn, { kind: 'ghost', onClick: () => set({ policies: f.policies.filter((_, k) => k !== i) }), title: t('p.remove') }, '×'),
            ),
            e(Field, { label: t('f.id'), hint: t('f.idHint') }, e(TextInput, { value: p.id, mono: true, onChange: (v) => setPolicy(i, { id: v }) })),
            e(Field, { label: t('f.name') }, e(TextInput, { value: p.name, onChange: (v) => setPolicy(i, { name: v }) })),
            e(Field, { label: t('f.desc') }, e(TextArea, { value: p.desc, rows: 2, onChange: (v) => setPolicy(i, { desc: v }) })),
            e(ModEditor, { t, mods: p.mods, onChange: (v) => setPolicy(i, { mods: v }) }),
          ),
        ),
        e(Btn, { kind: 'ghost', onClick: () => set({ policies: f.policies.concat([blankPolicy()]) }) }, t('p.add')),
      )
    }

    const FORMS = { advance: AdvanceForm, decision: DecisionForm, event: EventForm, privilege: PrivilegeForm, law: LawForm }

    const emptyForms = () => ({
      advance: { id: '', name: '', desc: '', age: 'age_1_traditions', icon: '', tag: '', potential: '', requires: [], unlocks: [], mods: [] },
      decision: { id: '', name: '', desc: '', category: 'other_decisions', tag: '', potential: '', allow: '', effect: '', option: '', ai: 100, mods: [] },
      event: { ns: '', num: 1, type: 'country_event', title: '', desc: '', trigger: '', option: '', effect: '', mods: [] },
      privilege: { id: '', name: '', desc: '', estate: 'nobles_estate', tag: '', potential: '', allow: '', mods: [] },
      law: { id: '', name: '', desc: '', category: 'socioeconomic', tag: '', potential: '', allow: '', policies: [blankPolicy()] },
    })

    /* ------------------------------------------------------------------ panel */
    function OutCard({ t, block: blk }) {
      const [copied, setCopied] = useState(false)
      const copy = async () => {
        let ok = false
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(blk.text)
            ok = true
          }
        } catch (err) { ok = false }
        if (!ok) {
          try {
            const ta = document.createElement('textarea')
            ta.value = blk.text
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            ok = true
          } catch (err) { ok = false }
        }
        if (ok) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        }
      }
      return e(
        'div',
        { className: 'pf-out-card' },
        e(
          'div',
          { className: 'pf-out-head' },
          e('span', { className: 'pf-out-title' }, t(blk.key)),
          e('code', { className: 'pf-path', title: blk.path }, blk.path),
          e(Btn, { kind: copied ? 'ok' : 'ghost', onClick: copy }, copied ? t('out.copied') : t('out.copy')),
        ),
        e('pre', { className: 'pf-code' }, blk.text),
      )
    }

    function DataError({ t, error, onRetry }) {
      return e(
        'div',
        { className: 'pf-data-state' },
        e('div', { className: 'pf-soon-title' }, t('load.fail')),
        e('p', { className: 'pf-soon-body' }, error),
        e('p', { className: 'pf-hint' }, t('load.hint')),
        e(Btn, { kind: 'primary', onClick: onRetry }, t('load.retry')),
      )
    }

    function EditExisting({ t, type, sources, info, onSaved }) {
      const [open, setOpen] = useState(false)
      const [entries, setEntries] = useState(null)
      const [loading, setLoading] = useState(false)
      const [q, setQ] = useState('')
      const [selected, setSelected] = useState(null)
      const [text, setText] = useState('')
      const [error, setError] = useState('')
      const [busy, setBusy] = useState(false)
      const [saved, setSaved] = useState('')
      const [loc, setLoc] = useState([])
      const [locOriginal, setLocOriginal] = useState({})

      const editable = (entry) => {
        const source = (info || [])[entry[3]]
        return !!source && source.kind === 'mod' && source.ok
      }

      const loadList = async () => {
        setLoading(true)
        setError('')
        try {
          const res = await fetch('/pdx-forge/entries', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ type, sources }),
          })
          const json = await res.json()
          if (!json.ok) throw new Error(json.error || String(res.status))
          setEntries(json.entries || [])
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
          setEntries([])
        } finally {
          setLoading(false)
        }
      }

      useEffect(() => {
        setEntries(null)
        setSelected(null)
        setText('')
        setSaved('')
        setLoc([])
        setLocOriginal({})
      }, [type])

      const toggle = () => {
        const next = !open
        setOpen(next)
        if (next && entries === null) loadList()
      }

      const pick = async (entry) => {
        setError('')
        setSaved('')
        setSelected(entry)
        setText('')
        setBusy(true)
        try {
          const res = await fetch('/pdx-forge/block', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sources, path: entry[2], id: entry[0], type }),
          })
          const json = await res.json()
          if (!json.ok) throw new Error(json.error || String(res.status))
          setText(json.text)
          const found = json.loc || []
          setLoc(found)
          setLocOriginal(Object.fromEntries(found.map((row) => [row.key, row.text])))
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
        } finally {
          setBusy(false)
        }
      }

      const save = async () => {
        if (!selected) return
        setBusy(true)
        setSaved('')
        setError('')
        try {
          const files = [{ path: selected[2], id: selected[0], mode: 'replace-block', text }]
          const sourceRoot = ((info || [])[selected[3]] || {}).path || ''
          const safeId = String(selected[0]).replace(/[^A-Za-z0-9_\-]/g, '_')
          const overridePath = sourceRoot
            ? `${sourceRoot.replace(/\\/g, '/')}/in_game/localization/simp_chinese/${safeId}_l_simp_chinese.yml`
            : ''
          const groups = new Map()
          for (const entry of loc) {
            const before = locOriginal[entry.key] == null ? '' : locOriginal[entry.key]
            if (entry.text === before) continue
            const target = entry.editable && entry.path ? entry.path : overridePath
            if (!target) continue
            const bucket = groups.get(target) || []
            bucket.push({ key: entry.key, text: entry.text })
            groups.set(target, bucket)
          }
          for (const [target, rows] of groups) files.push({ path: target, mode: 'loc-upsert', entries: rows })

          const res = await fetch('/pdx-forge/write', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sources, files }),
          })
          const json = await res.json()
          const failed = (json.files || []).filter((f) => !f.ok)
          if (!json.ok || failed.length) throw new Error(failed.map((f) => f.error).join('；') || json.error || t('edit.save'))
          setSaved(t('edit.saved'))
          setLocOriginal(Object.fromEntries(loc.map((row) => [row.key, row.text])))
          if (onSaved) onSaved()
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
        } finally {
          setBusy(false)
        }
      }

      const query = q.trim().toLowerCase()
      const locLabel = (key) => {
        const base = selected ? selected[0] : ''
        if (!base) return key
        if (key === base) return t('edit.locName')
        if (key === base + '_desc') return t('edit.locDesc')
        if (key === base + '.title') return t('edit.locTitle')
        if (key === base + '.desc') return t('edit.locDesc')
        if (key.startsWith(base + '.')) return `${t('edit.locOption')} ${key.slice(base.length + 1)}`
        return key
      }
      const list = (entries || []).filter((entry) => {
        if (!editable(entry)) return false
        if (!query) return true
        return entry[0].toLowerCase().includes(query) || (entry[1] || '').toLowerCase().includes(query)
      })
      const visible = list.slice(0, 200)

      return e(
        'div',
        { className: 'pf-sec' },
        e(
          'div',
          { className: 'pf-sec-h' },
          t('edit.toggle'),
          e('span', { className: 'pf-spacer' }),
          e(Btn, { kind: 'ghost', onClick: toggle }, open ? '▴' : '▾'),
        ),
        open
          ? e(
              React.Fragment,
              null,
              e('p', { className: 'pf-hint' }, t('edit.hint')),
              selected
                ? e(
                    React.Fragment,
                    null,
                    e('div', { className: 'pf-edit-meta' },
                      e('code', { className: 'pf-edit-id' }, selected[0]),
                      e('span', { className: 'pf-edit-path', title: selected[2] }, selected[2])),
                    e('textarea', {
                      className: 'pf-area pf-mono pf-edit-text',
                      value: text,
                      rows: 18,
                      spellCheck: false,
                      onChange: (ev) => setText(ev.target.value),
                    }),
                    loc.length
                      ? e(
                          'div',
                          { className: 'pf-loc' },
                          e('div', { className: 'pf-sec-h' }, t('edit.locSection')),
                          loc.map((entry, index) =>
                            e(
                              'div',
                              { className: 'pf-loc-row', key: entry.key },
                              e('span', { className: 'pf-loc-label', title: entry.key }, locLabel(entry.key)),
                              e(TextInput, {
                                value: entry.text,
                                onChange: (value) => setLoc(loc.map((row, i) => (i === index ? { ...row, text: value } : row))),
                              }),
                              e(Badge, { tone: entry.editable ? 'mod' : null }, entry.path
                                ? (entry.editable ? t('edit.locMod') : t('edit.locOverride'))
                                : t('edit.locNew')),
                            ),
                          ),
                          e('span', { className: 'pf-hint' }, t('edit.locHint')),
                        )
                      : null,
                    e(
                      'div',
                      { className: 'pf-row' },
                      e(Btn, { kind: 'primary', onClick: save, disabled: busy || !text.trim() }, busy ? t('edit.saving') : t('edit.save')),
                      e(Btn, { kind: 'ghost', onClick: () => { setSelected(null); setText(''); setSaved(''); setError('') } }, t('edit.cancel')),
                      saved ? e('span', { className: 'pf-msg pf-msg-ok' }, saved) : null,
                      error ? e('span', { className: 'pf-msg pf-msg-bad' }, error) : null,
                    ),
                  )
                : e(
                    React.Fragment,
                    null,
                    e(TextInput, { value: q, onChange: setQ, placeholder: t('edit.search') }),
                    loading ? e('div', { className: 'pf-empty' }, t('edit.loading')) : null,
                    !loading && list.length === 0 ? e('div', { className: 'pf-empty' }, t('edit.empty')) : null,
                    list.length
                      ? e(
                          'div',
                          { className: 'pf-results' },
                          visible.map((entry) =>
                            e(
                              'button',
                              { type: 'button', key: entry[3] + ':' + entry[0], className: 'pf-result', onClick: () => pick(entry) },
                              e('span', { className: 'pf-res-name' }, entry[1] || entry[0]),
                              e('code', { className: 'pf-res-key' }, entry[0]),
                              e(Badge, { tone: 'mod' }, (info[entry[3]] || {}).label || 'MOD'),
                            ),
                          ),
                        )
                      : null,
                    list.length > visible.length ? e('div', { className: 'pf-hint' }, t('m.count', { n: list.length, m: visible.length })) : null,
                    error ? e('div', { className: 'pf-msg pf-msg-bad' }, error) : null,
                  ),
            )
          : null,
      )
    }

    function SourcesView({ t, info, scanning, onApply, onRescan }) {
      const [pathInput, setPathInput] = useState('')
      const [kind, setKind] = useState('mod')
      const rows = info || []
      const asSource = (s) => ({ path: s.path, kind: s.kind, label: s.label })
      const add = () => {
        const nextPath = pathInput.trim()
        if (!nextPath) return
        const next = rows.map(asSource)
        if (!next.some((s) => s.path.toLowerCase() === nextPath.toLowerCase())) next.push({ path: nextPath, kind, label: '' })
        setPathInput('')
        onApply(next)
      }
      return e(
        'div',
        { className: 'pf-sources' },
        e(
          'div',
          { className: 'pf-sec' },
          e('div', { className: 'pf-sec-h' }, t('src.title')),
          e('p', { className: 'pf-hint' }, t('src.hint')),
          e(
            'div',
            { className: 'pf-src-add' },
            e(TextInput, { value: pathInput, onChange: setPathInput, mono: true, placeholder: 'D:\\SteamLibrary\\steamapps\\common\\Europa Universalis V\\game' }),
            e('div', { className: 'pf-src-kind' }, e(Select, {
              value: kind,
              onChange: setKind,
              options: [{ value: 'game', label: t('src.game') }, { value: 'mod', label: t('src.mod') }],
            })),
            e(Btn, { kind: 'primary', onClick: add }, t('src.add')),
            e(Btn, { kind: 'ghost', onClick: onRescan, disabled: scanning }, scanning ? t('src.scanning') : t('src.rescan')),
          ),
        ),
        e(
          'div',
          { className: 'pf-src-list' },
          rows.length === 0 ? e('div', { className: 'pf-empty' }, t('src.empty')) : null,
          rows.map((s) =>
            e(
              'div',
              { className: 'pf-src-row', key: s.index + ':' + s.path },
              e(
                'div',
                { className: 'pf-src-main' },
                e(
                  'div',
                  { className: 'pf-src-label' },
                  s.label,
                  e(Badge, { tone: s.kind === 'game' ? null : 'mod' }, s.kind === 'game' ? t('src.game') : t('src.mod')),
                  s.ok ? null : e(Badge, { tone: 'warn' }, t('src.invalid') + s.error),
                ),
                e('div', { className: 'pf-src-path' }, s.path),
                e('div', { className: 'pf-src-counts' }, s.ok
                  ? t('src.counts', { a: s.counts.advances, m: s.counts.modifiers, g: s.counts.ages, e: s.counts.estates })
                  : s.error),
              ),
              e(Btn, { kind: 'ghost', onClick: () => onApply(rows.filter((x) => x.index !== s.index).map(asSource)) }, t('src.remove')),
            ),
          ),
        ),
      )
    }

    function ForgePanel({ ctx, t, dataOverride }) {
      useLocaleTick(ctx)
      const [state, setState] = useState(() => {
        const saved = loadState()
        const forms = emptyForms()
        if (saved && saved.forms) {
          for (const key of Object.keys(forms)) {
            if (saved.forms[key] && typeof saved.forms[key] === 'object') forms[key] = { ...forms[key], ...saved.forms[key] }
          }
        }
        return {
          game: (saved && saved.game) || 'eu5',
          type: (saved && saved.type) || 'advance',
          forms,
          customAdvances: (saved && Array.isArray(saved.customAdvances) && saved.customAdvances) || [],
          sources: (saved && Array.isArray(saved.sources) && saved.sources) || null,
        }
      })
      const [data, setData] = useState(dataOverride || null)
      const [load, setLoad] = useState(dataOverride ? 'ready' : 'loading')
      const [error, setError] = useState('')
      const [view, setView] = useState('forge')
      const [writeState, setWriteState] = useState({ busy: false, message: '', tone: '' })
      const [targets, setTargets] = useState({ open: false, error: '', browsing: '', script: '', loc: '', scriptName: '', locName: '' })
      const sourcesRef = useRef(state.sources)

      useEffect(() => { sourcesRef.current = state.sources }, [state.sources])

      useEffect(() => {
        setTargets((t) => ({ ...t, open: false, script: '', loc: '', scriptName: '', locName: '', error: '' }))
      }, [state.type])

      const refresh = useCallback(async (force, silent, nextSources) => {
        const sources = nextSources !== undefined ? nextSources : sourcesRef.current
        if (!silent) setLoad('loading')
        setError('')
        try {
          const res = await fetch('/pdx-forge/scan', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sources: sources || undefined, refresh: !!force }),
          })
          const json = await res.json()
          if (!json.ok) throw new Error(json.error || String(res.status))
          setData(json)
          setState((s) => ({
            ...s,
            sources: (json.sources || []).map((x) => ({ path: x.path, kind: x.kind, label: x.label })),
          }))
          setLoad('ready')
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
          if (!silent) setLoad('error')
        }
      }, [])

      useEffect(() => {
        if (!dataOverride) refresh(false)
      }, [dataOverride, refresh])

      useEffect(() => {
        const timer = setTimeout(() => saveState(state), 400)
        return () => clearTimeout(timer)
      }, [state])

      useEffect(() => {
        const onRecord = (ev) => {
          const detail = ev.detail || {}
          if (!detail.id) return
          setState((s) => {
            const rest = s.customAdvances.filter((c) => c.id !== detail.id)
            return { ...s, customAdvances: rest.concat([{ id: detail.id, name: detail.name || '' }]).slice(-200) }
          })
        }
        window.addEventListener('pdx-forge:record', onRecord)
        return () => window.removeEventListener('pdx-forge:record', onRecord)
      }, [])

      const idx = useMemo(() => (data ? makeIndex(data) : null), [data])

      const form = state.forms[state.type]
      const setForm = (patch) => setState((s) => ({ ...s, forms: { ...s.forms, [s.type]: { ...s.forms[s.type], ...patch } } }))
      const replaceForm = (next) => setState((s) => ({ ...s, forms: { ...s.forms, [s.type]: next } }))

      const generated = useMemo(() => {
        if (!idx || state.game !== 'eu5') return null
        return GENERATORS[state.type](form, idx)
      }, [state.type, form, state.game, idx])

      const applyAi = (fields) => {
        const patch = {}
        const filled = []
        for (const key of ['potential', 'allow', 'trigger', 'effect', 'option']) {
          const value = fields[key]
          if (typeof value === 'string' && value.trim()) {
            patch[key] = value.trim()
            filled.push(key)
          }
        }
        if (filled.length) setForm(patch)
        return filled
      }

      const writeAll = async () => {
        if (!generated || !generated.blocks) return
        setWriteState({ busy: true, message: t('out.writing'), tone: '' })
        try {
          const payload = buildWritePayload(generated.blocks, targets)
          const res = await fetch('/pdx-forge/write', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sources: activeSources, files: payload }),
          })
          const json = await res.json()
          if (!json.ok) {
            const bad = (json.files || []).filter((f) => !f.ok)
            throw new Error(bad.length ? bad.map((f) => `${f.path}: ${f.error}`).join('\n') : json.error || t('out.writeFail'))
          }
          const appended = (json.files || []).reduce((sum, f) => sum + (f.added || 0), 0)
          setWriteState({ busy: false, message: t('out.written', { n: json.files.length }) + (appended ? ' · +' + appended : ''), tone: 'ok' })
          refresh(true, true)
        } catch (err) {
          setWriteState({ busy: false, message: String(err && err.message ? err.message : err), tone: 'bad' })
        }
      }

      const toggleTargets = () => setTargets((tk) => ({ ...tk, open: !tk.open, error: '' }))

      const browse = async (kind) => {
        setTargets((tk) => ({ ...tk, browsing: kind, error: '' }))
        try {
          const res = await fetch('/pdx-forge/pick', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ kind, type: state.type, sources: activeSources }),
          })
          const json = await res.json()
          if (json.canceled) {
            setTargets((tk) => ({ ...tk, browsing: '' }))
            return
          }
          if (!json.ok) throw new Error(json.error || t('out.writeFail'))
          setTargets((tk) => ({ ...tk, browsing: '', [kind === 'loc' ? 'loc' : 'script']: json.path }))
        } catch (err) {
          setTargets((tk) => ({ ...tk, browsing: '', error: String(err && err.message ? err.message : err) }))
        }
      }

      const Form = FORMS[state.type]
      const activeSources = ((data && data.sources) || []).map((s) => ({ path: s.path, kind: s.kind, label: s.label }))
      const game = GAMES.find((g) => g.id === state.game) || GAMES[0]
      const blockBase = (key) => {
        const blk = generated && generated.blocks ? generated.blocks.find((b) => b.key === key) : null
        return blk ? blk.path.split('/').pop() : ''
      }
      const scriptDefaultName = blockBase('out.script')
      const locDefaultName = blockBase('out.loc')

      const sample = () => {
        const demo = {
          advance: { id: 'demo_advance', name: '示例革新', desc: '这是一条由模改工坊生成的示例革新。', tag: 'BA2', requires: ['feudalism_advance'], mods: [{ key: 'monthly_prestige', value: '0.5' }] },
          decision: { id: 'demo_decision', name: '示例决议', desc: '这是一条示例决议。', tag: 'BA2', effect: 'add_gold = 100', option: '好', mods: [{ key: 'monthly_prestige', value: '0.2' }] },
          event: { ns: 'demo_events', num: 1, title: '示例事件', desc: '这是一条示例事件。', option: '好', effect: 'add_prestige = 10', mods: [{ key: 'monthly_legitimacy', value: '0.1' }] },
          privilege: { id: 'demo_privilege', name: '示例特权', desc: '这是一条示例特权。', mods: [{ key: 'global_nobles_estate_power', value: '0.1' }] },
          law: {
            id: 'demo_law',
            name: '示例法律',
            desc: '这是一条示例法律。',
            policies: [
              { id: 'demo_law_a', name: '示例政策甲', desc: '甲方案。', mods: [{ key: 'monthly_prestige', value: '0.1' }] },
              { id: 'demo_law_b', name: '示例政策乙', desc: '乙方案。', mods: [{ key: 'monthly_legitimacy', value: '0.1' }] },
            ],
          },
        }[state.type]
        replaceForm({ ...emptyForms()[state.type], ...demo })
      }

      const header = e(Head, { t, state, setState })

      if (state.game !== 'eu5') {
        return e(
          'div',
          { className: 'pf-root' },
          e(Style, null),
          header,
          e(
            'div',
            { className: 'pf-soon' },
            e('div', { className: 'pf-soon-title' }, t('soon.title')),
            e('p', { className: 'pf-soon-body' }, t('soon.body')),
            e('pre', { className: 'pf-code pf-soon-code' }, "// Host:  scan(gameRoot, modRoot) -> { meta, modifiers, advances }\n// Client: 同一套 FORMS / GENERATORS，按游戏替换扫描器与模板\nGAMES = [\n  { id: 'eu5', ready: true },\n  { id: 'eu4', ready: false },\n]"),
          ),
        )
      }

      if (load === 'loading') {
        return e(
          'div',
          { className: 'pf-root' },
          e(Style, null),
          header,
          e('div', { className: 'pf-data-state' }, e('div', { className: 'pf-spinner' }), e('div', { className: 'pf-soon-title' }, t('load.title'))),
        )
      }
      if (load === 'error' || !idx) {
        const fallback = (state.sources || data?.sources || []).map((s, index) => ({
          index,
          label: s.label,
          path: s.path,
          kind: s.kind,
          ok: false,
          error: error || t('load.fail'),
          counts: { advances: 0, modifiers: 0, ages: 0, estates: 0 },
        }))
        return e(
          'div',
          { className: 'pf-root' },
          e(Style, null),
          header,
          e(DataError, { t, error: error || t('load.fail'), onRetry: () => refresh(true) }),
          e(SourcesView, {
            t,
            info: fallback,
            scanning: load === 'loading',
            onApply: (next) => refresh(true, false, next),
            onRescan: () => refresh(true, false, sourcesRef.current || undefined),
          }),
        )
      }

      return e(
        ForgeCtx.Provider,
        { value: { t, data, idx, sources: data.sources || [], customAdvances: state.customAdvances } },
        e(
          'div',
          { className: 'pf-root' },
          e(Style, null),
          header,
          e(
            'div',
            { className: 'pf-tabs', role: 'tablist' },
            TYPES.map((type) =>
              e(
                'button',
                {
                  type: 'button',
                  key: type.id,
                  role: 'tab',
                  'aria-selected': view === 'forge' && state.type === type.id,
                  className: 'pf-tab' + (view === 'forge' && state.type === type.id ? ' is-on' : ''),
                  onClick: () => { setView('forge'); setState((s) => ({ ...s, type: type.id })) },
                },
                t(type.key),
              ),
            ),
            e(
              'button',
              {
                type: 'button',
                className: 'pf-tab pf-tab-right' + (view === 'sources' ? ' is-on' : ''),
                onClick: () => setView(view === 'sources' ? 'forge' : 'sources'),
              },
              t('src.tab') + (data.sources ? ' (' + data.sources.filter((s) => s.ok).length + ')' : ''),
            ),
          ),
          view === 'sources'
            ? e(SourcesView, {
                t,
                info: data.sources || [],
                scanning: load === 'loading',
                onApply: (next) => refresh(true, false, next),
                onRescan: () => refresh(true, false, sourcesRef.current || undefined),
              })
            : e(
            'div',
            { className: 'pf-body' },
            e(
              'div',
              { className: 'pf-form' },
              e(EditExisting, {
                t,
                type: state.type,
                sources: activeSources,
                info: data.sources || [],
                onSaved: () => refresh(true, true),
              }),
              e(Form, { t, f: form, set: setForm, applyAi }),
              e(
                'div',
                { className: 'pf-actions' },
                e(Btn, { kind: 'ghost', onClick: () => replaceForm(emptyForms()[state.type]) }, t('act.reset')),
                e(Btn, { kind: 'ghost', onClick: sample }, t('act.sample')),
                e(Btn, { kind: 'ghost', onClick: () => refresh(true) }, t('act.refresh')),
              ),
            ),
            e(
              'div',
              { className: 'pf-out' },
              e(
                'div',
                { className: 'pf-out-bar' },
                e(
                  'div',
                  { className: 'pf-counts' },
                  e('span', null, t('data.mods', { n: data.counts.modifiers })),
                  e('span', { className: 'pf-dotsep' }, '·'),
                  e('span', null, t('data.customMods', { n: data.counts.customModifiers })),
                  e('span', { className: 'pf-dotsep' }, '·'),
                  e('span', null, t('data.adv', { n: data.counts.advances })),
                ),
                e(
                  'div',
                  { className: 'pf-write' },
                  writeState.message
                    ? e('span', { className: 'pf-msg ' + (writeState.tone === 'ok' ? 'pf-msg-ok' : writeState.tone === 'bad' ? 'pf-msg-bad' : '') }, writeState.message)
                    : null,
                  e(
                    'div',
                    { className: 'pf-send' },
                    e(Btn, { kind: 'primary', onClick: writeAll, disabled: writeState.busy || !generated || !!generated.error }, t('out.write')),
                    e(Btn, { kind: 'ghost', onClick: toggleTargets, title: t('out.targets'), disabled: !generated || !!generated.error }, targets.open ? '▴' : '▾'),
                  ),
                ),
              ),
              targets.open
                ? e(
                    'div',
                    { className: 'pf-targets' },
                    e('div', { className: 'pf-sec-h' }, t('out.targets')),
                    e(
                      'div',
                      { className: 'pf-target-row' },
                      e('span', { className: 'pf-target-label' }, t('out.scriptFile')),
                      e(
                        'div',
                        { className: 'pf-target-pick' },
                        e('span', { className: 'pf-target-value' + (targets.script ? ' is-picked' : ''), title: targets.script || scriptDefaultName },
                          targets.script || (t('out.newFile') + (scriptDefaultName ? ' · ' + scriptDefaultName : ''))),
                        e(Btn, { kind: 'ghost', onClick: () => browse('script'), disabled: targets.browsing === 'script' },
                          targets.browsing === 'script' ? t('out.browsing') : t('out.browse')),
                        targets.script ? e(Btn, { kind: 'ghost', onClick: () => setTargets((tk) => ({ ...tk, script: '' })), title: t('out.clearPick') }, '×') : null,
                      ),
                    ),
                    targets.script === ''
                      ? e('div', { className: 'pf-target-row' }, e('span', { className: 'pf-target-label' }, t('out.fileName')), e(TextInput, {
                          value: targets.scriptName,
                          mono: true,
                          placeholder: scriptDefaultName,
                          onChange: (v) => setTargets((tk) => ({ ...tk, scriptName: v })),
                        }))
                      : null,
                    e(
                      'div',
                      { className: 'pf-target-row' },
                      e('span', { className: 'pf-target-label' }, t('out.locFile')),
                      e(
                        'div',
                        { className: 'pf-target-pick' },
                        e('span', { className: 'pf-target-value' + (targets.loc ? ' is-picked' : ''), title: targets.loc || locDefaultName },
                          targets.loc || (t('out.newFile') + (locDefaultName ? ' · ' + locDefaultName : ''))),
                        e(Btn, { kind: 'ghost', onClick: () => browse('loc'), disabled: targets.browsing === 'loc' },
                          targets.browsing === 'loc' ? t('out.browsing') : t('out.browse')),
                        targets.loc ? e(Btn, { kind: 'ghost', onClick: () => setTargets((tk) => ({ ...tk, loc: '' })), title: t('out.clearPick') }, '×') : null,
                      ),
                    ),
                    targets.loc === ''
                      ? e('div', { className: 'pf-target-row' }, e('span', { className: 'pf-target-label' }, t('out.fileName')), e(TextInput, {
                          value: targets.locName,
                          mono: true,
                          placeholder: locDefaultName,
                          onChange: (v) => setTargets((tk) => ({ ...tk, locName: v })),
                        }))
                      : null,
                    e('div', { className: 'pf-hint' }, t('out.appendHint')),
                    targets.error ? e('div', { className: 'pf-msg pf-msg-bad' }, targets.error) : null,
                  )
                : null,
              generated && generated.error
                ? e('div', { className: 'pf-out-empty' }, t(generated.error))
                : generated && generated.blocks
                  ? generated.blocks.map((blk) => e(OutCard, { key: blk.path, t, block: blk }))
                  : e('div', { className: 'pf-out-empty' }, t('out.empty')),
              e('div', { className: 'pf-hint pf-foot' }, t('out.bom') + '  ' + t('out.root') + ': ' + (data.roots.mod || '')),
            ),
          ),
        ),
      )
    }

    function Head({ t, state, setState }) {
      return e(
        'div',
        { className: 'pf-head' },
        e(Glyph, { size: 22 }),
        e(
          'div',
          { className: 'pf-brand' },
          e('div', { className: 'pf-title' }, t('panel.title')),
          e('div', { className: 'pf-sub' }, t('panel.subtitle')),
        ),
        e(
          'div',
          { className: 'pf-games' },
          GAMES.map((g) =>
            e(
              'button',
              {
                type: 'button',
                key: g.id,
                className: 'pf-game' + (state.game === g.id ? ' is-on' : '') + (g.ready ? '' : ' is-soon'),
                title: g.ready ? '' : t('game.more'),
                onClick: () => setState((s) => ({ ...s, game: g.id })),
              },
              g.key ? t(g.key) : g.label,
              g.ready ? null : e('span', { className: 'pf-dot' }),
            ),
          ),
        ),
      )
    }

    const TYPES = [
      { id: 'advance', key: 'tab.advance' },
      { id: 'decision', key: 'tab.decision' },
      { id: 'event', key: 'tab.event' },
      { id: 'privilege', key: 'tab.privilege' },
      { id: 'law', key: 'tab.law' },
    ]

    // Adding another Paradox title: register it here with its own scanner data + gen* hooks.
    const GAMES = [
      { id: 'eu5', key: 'game.eu5', ready: true },
      { id: 'eu4', label: 'EU4', ready: false },
      { id: 'vic3', label: 'Victoria 3', ready: false },
      { id: 'hoi4', label: 'HOI4', ready: false },
      { id: 'ck3', label: 'CK3', ready: false },
      { id: 'stellaris', label: 'Stellaris', ready: false },
    ]

    function Glyph({ size }) {
      return e(
        'svg',
        { width: size || 20, height: size || 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        e('path', { d: 'M6 3.5h9.5A2.5 2.5 0 0 1 18 6v15.5H8.5A2.5 2.5 0 0 1 6 19V3.5z', stroke: 'currentColor', strokeWidth: 1.6 }),
        e('path', { d: 'M6 19a2.5 2.5 0 0 1 2.5-2.5H18', stroke: 'currentColor', strokeWidth: 1.6 }),
        e('path', { d: 'M9.5 7.5h5M9.5 11h5M9.5 14.5h3', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        e('circle', { cx: 18.5, cy: 5.5, r: 2.1, fill: 'currentColor' }),
      )
    }

    function Style() {
      return e('style', null, `
.pf-root{display:flex;flex-direction:column;height:100%;flex:1 1 auto;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5}
.pf-head{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}
.pf-brand{display:flex;flex-direction:column;min-width:0}
.pf-title{font-size:14px;font-weight:600;white-space:nowrap}
.pf-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.pf-games{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.pf-game{font:inherit;font-size:11.5px;padding:3px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.pf-game.is-on{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.pf-game.is-soon{opacity:.55}
.pf-dot{display:inline-block;width:5px;height:5px;border-radius:50%;margin-left:5px;background:currentColor;opacity:.6;vertical-align:middle}
.pf-tabs{display:flex;gap:6px;padding:8px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 55%,var(--dsw-alias-bg-base))}
.pf-tab{font:inherit;font-size:12.5px;padding:4px 14px;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.pf-tab:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-primary)}
.pf-tab.is-on{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-weight:600}
.pf-tab-right{margin-left:auto}
.pf-sources{flex:1 1 auto;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.pf-src-list{display:flex;flex-direction:column;gap:8px}
.pf-src-row{display:flex;align-items:center;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;background:var(--dsw-alias-bg-layer-1)}
.pf-src-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
.pf-src-label{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600}
.pf-src-path{font-size:10.5px;font-family:ui-monospace,Consolas,monospace;color:var(--dsw-alias-label-secondary);word-break:break-all}
.pf-src-counts{font-size:11px;color:var(--dsw-alias-label-secondary)}
.pf-src-add{display:flex;gap:8px;align-items:center}
.pf-src-add > .pf-input{flex:1 1 auto;min-width:0}
.pf-src-kind{flex:0 0 92px}
.pf-meta-row{display:flex;align-items:center;gap:8px}
.pf-src{flex:0 0 140px!important}
.pf-edit-meta{display:flex;align-items:baseline;gap:8px;min-width:0}
.pf-edit-id{font-family:ui-monospace,Consolas,monospace;font-size:11.5px;color:var(--dsw-alias-label-primary);flex:0 0 auto}
.pf-edit-path{font-size:10.5px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-edit-text{min-height:260px;line-height:1.5}
.pf-loc{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:10px}
.pf-loc-row{display:flex;align-items:center;gap:8px}
.pf-loc-label{flex:0 0 92px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-loc-row > .pf-input{flex:1 1 auto;min-width:0}
.pf-body{flex:1 1 auto;display:flex;min-height:0}
.pf-form{flex:1 1 47%;min-width:0;overflow:auto;padding:14px 16px 20px;display:flex;flex-direction:column;gap:14px;border-right:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base)}
.pf-out{flex:1 1 53%;min-width:0;overflow:auto;padding:14px 16px 20px;display:flex;flex-direction:column;gap:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 70%,var(--dsw-alias-bg-base))}
.pf-sec{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 1px 2px color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.pf-sec-h{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;letter-spacing:0;color:var(--dsw-alias-label-primary);border-left:3px solid var(--dsw-alias-brand-primary);padding-left:8px;margin-left:-2px}
.pf-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.pf-label{font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-primary);opacity:.72;letter-spacing:.01em}
.pf-hint{font-size:11px;color:var(--dsw-alias-label-secondary);opacity:.9}
.pf-msg{opacity:1}
.pf-msg-ok{color:var(--dsw-alias-state-success-primary)}
.pf-msg-bad{color:var(--dsw-alias-state-error-primary)}
.pf-row{display:flex;gap:8px;align-items:flex-end}
.pf-row > *{flex:1 1 0;min-width:0}
.pf-row > .pf-btn{flex:0 0 auto}
.pf-input,.pf-area,.pf-select{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;color:inherit;padding:7px 9px;font:inherit;font-size:12.5px;width:100%;box-sizing:border-box;box-shadow:inset 0 1px 2px color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);transition:border-color .12s ease,box-shadow .12s ease}
.pf-select{padding:6px 7px}
.pf-input::placeholder,.pf-area::placeholder{color:var(--dsw-alias-label-secondary);opacity:.6}
.pf-input:hover,.pf-area:hover,.pf-select:hover{border-color:var(--dsw-alias-label-secondary)}
.pf-input:focus,.pf-area:focus,.pf-select:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
.pf-area{resize:vertical;line-height:1.5}
.pf-mono{font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace;font-size:12px}
.pf-btn{font:inherit;font-size:12px;padding:4px 10px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap}
.pf-btn:hover{border-color:var(--dsw-alias-brand-primary)}
.pf-btn:disabled{opacity:.5;cursor:not-allowed}
.pf-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.pf-btn-ghost{background:transparent;border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.pf-btn-ok{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary);background:transparent}
.pf-badge{font-size:10px;padding:0 5px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);line-height:1.6}
.pf-badge-pct{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.pf-badge-bool{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}
.pf-badge-mod{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.pf-picker{display:flex;flex-direction:column;gap:8px}
.pf-cat{flex:0 0 132px!important}
.pf-count{font-size:10.5px;color:var(--dsw-alias-label-secondary);opacity:.85}
.pf-results{max-height:260px;overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base)}
.pf-result{display:flex;align-items:baseline;gap:8px;padding:5px 8px;background:transparent;border:0;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 60%,transparent);color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer;width:100%}
.pf-result:last-child{border-bottom:0}
.pf-result:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent)}
.pf-result:disabled{opacity:.6;cursor:not-allowed}
.pf-res-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-res-key{font-family:ui-monospace,Consolas,monospace;font-size:10.5px;color:var(--dsw-alias-label-secondary);flex:0 0 auto;max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-empty{font-size:11.5px;color:var(--dsw-alias-label-secondary);padding:6px 2px}
.pf-mods{display:flex;flex-direction:column;gap:8px}
.pf-mod-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-base)}
.pf-mod-info{flex:1 1 auto;min-width:0;display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
.pf-mod-name{font-size:12px}
.pf-mod-key{font-size:10.5px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Consolas,monospace}
.pf-mod-row > .pf-input{flex:0 0 108px;width:108px}
.pf-chips{display:flex;flex-wrap:wrap;gap:6px}
.pf-chip{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;padding:2px 4px 2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.pf-chip-key{font-size:10px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Consolas,monospace}
.pf-chip-x{border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;line-height:1;padding:0 4px}
.pf-chip-x:hover{color:var(--dsw-alias-state-error-primary)}
.pf-actions{display:flex;gap:8px;justify-content:flex-end;padding:10px 2px 4px;border-top:1px solid var(--dsw-alias-border-l1);margin-top:2px}
.pf-spacer{flex:1 1 auto}
.pf-out-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pf-counts{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--dsw-alias-label-secondary);flex:1 1 auto}
.pf-dotsep{opacity:.5}
.pf-write{display:flex;align-items:center;gap:8px}
.pf-send{display:flex;align-items:stretch;gap:0}
.pf-send > .pf-btn:first-child{border-top-right-radius:0;border-bottom-right-radius:0}
.pf-send > .pf-btn:last-child{border-top-left-radius:0;border-bottom-left-radius:0;border-left:0;padding:4px 7px}
.pf-targets{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--dsw-alias-bg-layer-1)}
.pf-target-row{display:flex;align-items:center;gap:10px}
.pf-target-label{flex:0 0 72px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.pf-target-pick{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:8px}
.pf-target-value{flex:1 1 auto;min-width:0;font-size:11.5px;font-family:ui-monospace,Consolas,monospace;color:var(--dsw-alias-label-secondary);padding:6px 8px;border:1px dashed var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-base);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-target-value.is-picked{color:var(--dsw-alias-label-primary);border-style:solid;border-color:var(--dsw-alias-brand-primary)}
.pf-cat-sm{flex:0 0 96px!important}
.pf-target-row > .pf-select,.pf-target-row > .pf-input{flex:1 1 auto;min-width:0}
.pf-out-card{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;flex:none;box-shadow:0 1px 2px color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.pf-out-head{display:flex;align-items:center;gap:10px;padding:7px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.pf-out-title{font-size:12px;font-weight:600;flex:0 0 auto}
.pf-path{flex:1 1 auto;min-width:0;font-size:10.5px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
.pf-code{margin:0;padding:10px 12px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11.5px;line-height:1.55;white-space:pre;tab-size:4;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);max-height:46vh}
.pf-out-empty{font-size:12px;color:var(--dsw-alias-label-secondary);padding:24px 12px;text-align:center;border:1px dashed var(--dsw-alias-border-l1);border-radius:9px}
.pf-foot{margin-top:auto;padding-top:4px;word-break:break-all}
.pf-soon{padding:32px 24px;display:flex;flex-direction:column;gap:12px;max-width:760px}
.pf-soon-title{font-size:15px;font-weight:600}
.pf-soon-body{margin:0;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.7;white-space:pre-wrap}
.pf-soon-code{max-height:none;border-radius:9px;border:1px solid var(--dsw-alias-border-l1)}
.pf-data-state{padding:32px 24px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.pf-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:pf-spin .8s linear infinite}
@keyframes pf-spin{to{transform:rotate(360deg)}}
`)
    }

    /* ------------------------------------------------------------------ apply */
    return {
      inject: ['slots'],
      apply(ctx) {
        const t = translator(ctx)
        ctx.effect(() => () => t.dispose())

        function ForgeRoot() {
          return e(ForgePanel, { ctx, t })
        }

        function SidebarEntry(props) {
          return e(
            'span',
            { className: 'pf-sidebar-entry', title: t('panel.title'), style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } },
            e(Glyph, { size: props.size || 20 }),
          )
        }

        ctx.effect(() =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              { name: 'sidebar.panellist', id: 'pdx-forge', order: 20, label: () => t('panel.title') },
              SidebarEntry,
            ),
          ),
        )

        ctx.effect(() =>
          ctx.slots.inject('main', () =>
            ctx.slots.register({ name: 'main', key: 'pdx-forge' }, ForgeRoot),
          ),
        )
      },
      // Exposed for tools/*.mjs only; nothing renders from here.
      _test: { genAdvance, genDecision, genEvent, genPrivilege, genLaw, makeIndex, emptyForms, buildWritePayload, panel: ForgePanel, forms: FORMS },
    }
  },
})
