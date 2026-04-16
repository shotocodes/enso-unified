import type { Locale } from "@/types";

export const commonTranslations: Record<string, Record<Locale, string>> = {
  // ===== Brand =====
  "app.name": { ja: "ENSO", en: "ENSO", zh: "ENSO", ko: "ENSO" },
  "app.credit": { ja: "by CreativeStudio SHOTO.", en: "by CreativeStudio SHOTO.", zh: "by CreativeStudio SHOTO.", ko: "by CreativeStudio SHOTO." },

  // App taglines (LP/dashboard)
  "app.timer": { ja: "人生という時間を可視化する", en: "Visualize life's time", zh: "将人生时间可视化", ko: "인생의 시간을 시각화하다" },
  "app.task": { ja: "目標を、行動に変える", en: "Turn goals into action", zh: "将目标转化为行动", ko: "목표를 행동으로" },
  "app.focus": { ja: "ポモドーロで集中力を鍛える", en: "Train focus with Pomodoro", zh: "用番茄钟训练专注力", ko: "포모도로로 집중력을 키우다" },
  "app.journal": { ja: "やったことが、勝手に日記になる", en: "Your actions become your journal", zh: "你的行动自动成为日记", ko: "행동이 자동으로 일기가 됩니다" },

  // ===== Bottom Navigation =====
  "nav.timer": { ja: "Timer", en: "Timer", zh: "Timer", ko: "Timer" },
  "nav.task": { ja: "Task", en: "Task", zh: "Task", ko: "Task" },
  "nav.dashboard": { ja: "Home", en: "Home", zh: "Home", ko: "Home" },
  "nav.focus": { ja: "Focus", en: "Focus", zh: "Focus", ko: "Focus" },
  "nav.journal": { ja: "Journal", en: "Journal", zh: "Journal", ko: "Journal" },

  // ===== Language names (in native script) =====
  "lang.ja": { ja: "日本語", en: "日本語", zh: "日本語", ko: "日本語" },
  "lang.en": { ja: "English", en: "English", zh: "English", ko: "English" },
  "lang.zh": { ja: "中文", en: "中文", zh: "中文", ko: "中文" },
  "lang.ko": { ja: "한국어", en: "한국어", zh: "한국어", ko: "한국어" },

  // ===== Theme =====
  "theme.dark": { ja: "ダーク", en: "Dark", zh: "深色", ko: "다크" },
  "theme.light": { ja: "ライト", en: "Light", zh: "浅色", ko: "라이트" },
  "theme.system": { ja: "システム", en: "System", zh: "系统", ko: "시스템" },

  // ===== Dashboard =====
  "home.subtitle": { ja: "人生をより意識的に生きるためのツール群", en: "A suite of tools for living more consciously", zh: "更有意识地生活的工具集", ko: "더 의식적으로 살기 위한 도구 모음" },
  "home.guide": { ja: "ENSOの使い方ガイド", en: "How to use ENSO", zh: "ENSO使用指南", ko: "ENSO 사용 가이드" },
  "dash.today": { ja: "Today", en: "Today", zh: "Today", ko: "Today" },
  "dash.goals": { ja: "Goals", en: "Goals", zh: "Goals", ko: "Goals" },
  "dash.apps": { ja: "Apps", en: "Apps", zh: "Apps", ko: "Apps" },
  "dash.focus": { ja: "Focus", en: "Focus", zh: "Focus", ko: "Focus" },
  "dash.tasks": { ja: "Tasks", en: "Tasks", zh: "Tasks", ko: "Tasks" },
  "dash.journal": { ja: "Journal", en: "Journal", zh: "Journal", ko: "Journal" },
  "dash.mood": { ja: "Mood", en: "Mood", zh: "Mood", ko: "Mood" },
  "dash.min": { ja: "min", en: "min", zh: "min", ko: "min" },
  "dash.streak": { ja: "streak", en: "streak", zh: "streak", ko: "streak" },
  "dash.days": { ja: "日", en: "d", zh: "天", ko: "일" },
  "dash.done": { ja: "done", en: "done", zh: "done", ko: "done" },
  "dash.active": { ja: "active", en: "active", zh: "active", ko: "active" },
  "dash.entries": { ja: "entries", en: "entries", zh: "entries", ko: "entries" },
  "dash.daysLeft": { ja: "日後", en: "days left", zh: "天后", ko: "일 남음" },
  "dash.noGoals": { ja: "TIMERで目標を設定しよう", en: "Set goals in TIMER", zh: "在TIMER中设定目标", ko: "TIMER에서 목표를 설정하세요" },
  "dash.noData": { ja: "—", en: "—", zh: "—", ko: "—" },

  // Onboarding
  "onboard.welcome": { ja: "Welcome to ENSO", en: "Welcome to ENSO", zh: "Welcome to ENSO", ko: "Welcome to ENSO" },
  "onboard.subtitle": { ja: "3ステップで始めよう", en: "Get started in 3 steps", zh: "3步开始", ko: "3단계로 시작하기" },
  "onboard.step1": { ja: "目標を設定する", en: "Set a goal", zh: "设定目标", ko: "목표 설정하기" },
  "onboard.step1.desc": { ja: "人生の残り時間を意識して、やりたいことを目標に", en: "Visualize your time and turn ambitions into goals", zh: "可视化你的时间，将愿望变为目标", ko: "시간을 시각화하고 꿈을 목표로" },
  "onboard.step2": { ja: "タスクに分解する", en: "Break into tasks", zh: "分解为任务", ko: "작업으로 분해하기" },
  "onboard.step2.desc": { ja: "AIが目標をマイルストーンとタスクに自動分解", en: "AI auto-breaks goals into milestones & tasks", zh: "AI自动将目标分解为里程碑和任务", ko: "AI가 목표를 마일스톤과 작업으로 자동 분해" },
  "onboard.step3": { ja: "集中を始める", en: "Start focusing", zh: "开始专注", ko: "집중 시작하기" },
  "onboard.step3.desc": { ja: "ポモドーロで集中。完了は自動でJOURNALに記録", en: "Focus with Pomodoro. Sessions auto-log to Journal", zh: "番茄钟专注。完成自动记录到日记", ko: "포모도로로 집중. 완료 시 자동으로 일기에 기록" },

  // Backup reminder
  "backup.title": { ja: "バックアップしましょう", en: "Time to back up", zh: "该备份了", ko: "백업할 시간입니다" },
  "backup.desc": { ja: "設定 → データ → エクスポートでバックアップできます", en: "Back up from Settings → Data → Export", zh: "在 设置 → 数据 → 导出 中备份", ko: "설정 → 데이터 → 내보내기에서 백업하세요" },
  "backup.dismiss": { ja: "OK", en: "OK", zh: "OK", ko: "OK" },

  // ===== Landing Page =====
  "lp.tagline": { ja: "日々をデザインし、時間を自分のものにする", en: "Design your days. Own your time.", zh: "设计你的每一天，掌控你的时间", ko: "하루를 디자인하고, 시간을 내 것으로" },
  "lp.cta": { ja: "ENSOをはじめる", en: "Enter ENSO", zh: "进入ENSO", ko: "ENSO 시작하기" },
  "lp.philosophy": { ja: "目標を立て、実行し、集中し、振り返る。\nENSOは、人とAIが融合した\n意識的に生きるためのエコシステム。", en: "Set goals. Execute. Focus. Reflect.\nENSO is an ecosystem where\nhuman intention and AI converge.", zh: "设定目标、执行、专注、回顾。\nENSO是人类意图与AI\n融合的生态系统。", ko: "목표를 세우고, 실행하고, 집중하고, 되돌아보기.\nENSO는 인간의 의도와 AI가\n융합된 생태계입니다." },
  "lp.ecosystem": { ja: "4つのアプリ、ひとつのエコシステム", en: "Four apps. One ecosystem.", zh: "四个应用，一个生态", ko: "네 개의 앱, 하나의 에코시스템" },
  "lp.cycle": { ja: "目標 → 実行 → 集中 → 振り返り → 繰り返す", en: "Goals → Execute → Focus → Reflect → Repeat", zh: "目标 → 执行 → 专注 → 回顾 → 重复", ko: "목표 → 실행 → 집중 → 되돌아보기 → 반복" },
  "lp.values": { ja: "なぜENSOなのか", en: "Built different.", zh: "与众不同", ko: "다르게 만들었습니다" },

  // ===== Guide =====
  "guide.title": { ja: "ENSO の使い方", en: "How to use ENSO", zh: "ENSO 使用指南", ko: "ENSO 사용 가이드" },
  "guide.subtitle": { ja: "人生をより意識的に生きるための4つのツール。\n目標を立てて、実行して、集中して、振り返る。", en: "4 tools for living more consciously.\nSet goals, execute, focus, and reflect.", zh: "4个让你更有意识生活的工具。\n设定目标、执行、专注、回顾。", ko: "더 의식적으로 살기 위한 4가지 도구.\n목표를 세우고, 실행하고, 집중하고, 되돌아보기." },
  "guide.steps": { ja: "4つのステップ", en: "4 Steps", zh: "4个步骤", ko: "4가지 단계" },
  "guide.step1.title": { ja: "ENSO TIMER で目標を立てる", en: "Set goals with ENSO TIMER", zh: "用ENSO TIMER设定目标", ko: "ENSO TIMER로 목표를 세우다" },
  "guide.step1.desc": { ja: "人生の残り時間を可視化し、やりたいことを目標として登録。期限を決めて、意識的に生きる第一歩。", en: "Visualize your remaining time and register your ambitions as goals. Set deadlines and take the first step to living consciously.", zh: "可视化人生剩余时间，将想做的事注册为目标。设定期限，迈出有意识生活的第一步。", ko: "남은 시간을 시각화하고 하고 싶은 것을 목표로 등록. 기한을 정해 의식적으로 사는 첫걸음." },
  "guide.step2.title": { ja: "ENSO TASK でタスクに分解", en: "Break down into tasks with ENSO TASK", zh: "用ENSO TASK分解为任务", ko: "ENSO TASK로 작업으로 분해" },
  "guide.step2.desc": { ja: "目標をマイルストーン→タスクに分解。AIが自動で分解もしてくれる。準備ができたタスクだけを「タスクに移行」して実行。", en: "Break goals into milestones and tasks. AI can auto-generate the breakdown. Move ready tasks to your active list.", zh: "将目标分解为里程碑和任务。AI可自动分解。将准备好的任务移至任务列表执行。", ko: "목표를 마일스톤과 작업으로 분해. AI가 자동으로 분해해줍니다. 준비된 작업만 '작업으로 이동'하여 실행." },
  "guide.step3.title": { ja: "ENSO FOCUS で集中する", en: "Focus with ENSO FOCUS", zh: "用ENSO FOCUS专注", ko: "ENSO FOCUS로 집중하다" },
  "guide.step3.desc": { ja: "ポモドーロタイマーで集中セッション。TASKからタスクを選んで集中開始。完了したセッションは自動でJOURNALに記録。", en: "Focus sessions with Pomodoro timer. Select a task from TASK and start focusing. Completed sessions auto-record to JOURNAL.", zh: "用番茄钟进行专注。从TASK选择任务开始集中。完成的会话自动记录到JOURNAL。", ko: "포모도로 타이머로 집중 세션. TASK에서 작업을 선택하고 집중 시작. 완료된 세션은 자동으로 JOURNAL에 기록." },
  "guide.step4.title": { ja: "ENSO JOURNAL で振り返る", en: "Reflect with ENSO JOURNAL", zh: "用ENSO JOURNAL回顾", ko: "ENSO JOURNAL로 되돌아보기" },
  "guide.step4.desc": { ja: "今日の行動が自動で日記に。一言コメントを添えるだけ。3年日記で去年の自分と出会える。AIが日記も書いてくれる。", en: "Today's actions become your journal automatically. Just add a quick note. Meet your past self with the 3-year diary.", zh: "今天的行动自动成为日记。只需添加一句话。三年日记让你遇见去年的自己。", ko: "오늘의 행동이 자동으로 일기가 됩니다. 한마디만 추가하세요. 3년 일기로 작년의 나와 만나세요." },

  // Features
  "feature.free": { ja: "完全無料", en: "Completely Free", zh: "完全免费", ko: "완전 무료" },
  "feature.free.desc": { ja: "すべてのアプリが無料。アカウント登録も不要。", en: "All apps are free. No account needed.", zh: "所有应用免费。无需注册账号。", ko: "모든 앱이 무료. 계정 등록 불필요." },
  "feature.private": { ja: "プライバシー安全", en: "Privacy Safe", zh: "隐私安全", ko: "프라이버시 안전" },
  "feature.private.desc": { ja: "データはあなたのブラウザにだけ保存。サーバーに送信されません。", en: "Data stays in your browser only. Nothing sent to servers.", zh: "数据仅保存在浏览器中。不会发送到服务器。", ko: "데이터는 브라우저에만 저장. 서버로 전송되지 않습니다." },
  "feature.i18n": { ja: "4言語対応", en: "4 Languages", zh: "4种语言", ko: "4개 언어" },
  "feature.i18n.desc": { ja: "日本語・English・中文・한국어に対応。", en: "Japanese, English, Chinese, Korean.", zh: "支持日语・英语・中文・韩语。", ko: "일본어・영어・중국어・한국어 지원." },
  "feature.theme": { ja: "ダーク / ライトモード", en: "Dark / Light Mode", zh: "深色/浅色模式", ko: "다크/라이트 모드" },
  "feature.theme.desc": { ja: "1箇所の設定でアプリ全体に反映。", en: "One setting applies to all apps.", zh: "一处设置应用全部。", ko: "한번의 설정으로 전체에 반영." },
  "feature.pwa": { ja: "ホーム画面に追加", en: "Add to Home Screen", zh: "添加到主屏幕", ko: "홈 화면에 추가" },
  "feature.pwa.desc": { ja: "Safariの共有ボタン → 「ホーム画面に追加」でアプリのように使えます。", en: "Safari share button → 'Add to Home Screen' to use like an app.", zh: "Safari分享按钮 → \"添加到主屏幕\"即可像应用一样使用。", ko: "Safari 공유 버튼 → '홈 화면에 추가'로 앱처럼 사용." },
  "feature.offline": { ja: "オフライン対応", en: "Works Offline", zh: "离线可用", ko: "오프라인 지원" },
  "feature.offline.desc": { ja: "一度読み込めば、ネットがなくても使えます。", en: "Once loaded, works without internet.", zh: "加载一次后即可离线使用。", ko: "한번 로드하면 인터넷 없이도 사용." },

  // PWA
  "pwa.title": { ja: "ホーム画面に追加する方法", en: "How to Add to Home Screen", zh: "如何添加到主屏幕", ko: "홈 화면에 추가하는 방법" },
  "pwa.step1": { ja: "iPhoneのSafariで ensolife.app を開く", en: "Open ensolife.app in Safari on iPhone", zh: "在iPhone的Safari中打开ensolife.app", ko: "iPhone의 Safari에서 ensolife.app 열기" },
  "pwa.step2": { ja: "画面下の 共有ボタン（□↑）をタップ", en: "Tap the Share button (□↑) at the bottom", zh: "点击底部的分享按钮(□↑)", ko: "하단의 공유 버튼(□↑)을 탭" },
  "pwa.step3": { ja: "「ホーム画面に追加」を選択", en: "Select 'Add to Home Screen'", zh: "选择\"添加到主屏幕\"", ko: "'홈 화면에 추가' 선택" },
  "pwa.step4": { ja: "ホーム画面にENSOのアイコンが追加されます", en: "ENSO icon will appear on your home screen", zh: "ENSO图标将出现在主屏幕上", ko: "홈 화면에 ENSO 아이콘이 추가됩니다" },

  // FAQ
  "faq.data.q": { ja: "データはどこに保存されていますか？", en: "Where is my data stored?", zh: "数据保存在哪里？", ko: "데이터는 어디에 저장되나요?" },
  "faq.data.a": { ja: "ブラウザのローカルストレージに保存されます。他の人からは見えません。ブラウザのデータを削除すると消えるため、設定→データ→エクスポートでバックアップを取ることをおすすめします。", en: "Stored in your browser's local storage. Invisible to others. Clearing browser data erases it, so we recommend Settings → Data → Export to back up.", zh: "保存在浏览器的本地存储中。其他人看不到。清除浏览器数据会删除，建议在 设置 → 数据 → 导出 中备份。", ko: "브라우저의 로컬 스토리지에 저장됩니다. 다른 사람에게 보이지 않습니다. 브라우저 데이터 삭제 시 사라지므로 설정 → 데이터 → 내보내기에서 백업을 권장합니다." },
  "faq.sync.q": { ja: "スマホとPCで同期できますか？", en: "Can I sync between phone and PC?", zh: "手机和电脑可以同步吗？", ko: "스마트폰과 PC에서 동기화할 수 있나요?" },
  "faq.sync.a": { ja: "現在はデバイス間の自動同期には対応していません。設定→データ→エクスポート/インポート機能でデータを移行できます。近日中にGoogle認証+クラウド同期を追加予定。", en: "Auto-sync between devices is not supported yet. You can transfer data via Settings → Data → Export/Import. Google auth + cloud sync coming soon.", zh: "目前不支持设备间自动同步。可以通过 设置 → 数据 → 导出/导入 功能转移数据。即将添加Google认证和云同步。", ko: "현재 기기 간 자동 동기화는 지원하지 않습니다. 설정 → 데이터 → 내보내기/가져오기 기능으로 데이터를 이전할 수 있습니다. Google 인증과 클라우드 동기화가 곧 추가될 예정." },
  "faq.taskjournal.q": { ja: "TASKで完了したタスクがJOURNALに表示されるには？", en: "How do completed tasks appear in JOURNAL?", zh: "TASK中完成的任务如何显示在JOURNAL中？", ko: "TASK에서 완료한 작업이 JOURNAL에 표시되려면?" },
  "faq.taskjournal.a": { ja: "タスクを完了した瞬間に自動でJOURNALに記録されます。", en: "Completed tasks are automatically recorded in JOURNAL the moment you check them off.", zh: "完成任务的瞬间会自动记录到JOURNAL中。", ko: "작업을 완료하는 순간 자동으로 JOURNAL에 기록됩니다." },
  "faq.ai.q": { ja: "AI機能は何回使えますか？", en: "How many times can I use AI features?", zh: "AI功能可以使用多少次？", ko: "AI 기능은 몇 번 사용할 수 있나요?" },
  "faq.ai.a": { ja: "JOURNAL のAI日記生成は1日5回、TASK のAI目標分解は1日10回まで無料でご利用いただけます。", en: "JOURNAL AI diary generation: 5 times/day. TASK AI goal breakdown: 10 times/day. Both free.", zh: "JOURNAL的AI日记生成每天5次，TASK的AI目标分解每天10次，均免费。", ko: "JOURNAL AI 일기 생성: 하루 5회, TASK AI 목표 분해: 하루 10회. 모두 무료." },
  "faq.flow.q": { ja: "アプリ同士はどうつながっていますか？", en: "How do the apps connect?", zh: "应用之间如何连接？", ko: "앱들은 어떻게 연결되나요?" },
  "faq.flow.a": { ja: "TIMER→TASK: 目標が自動で同期。TASK→FOCUS: タスクをタップして即集中。FOCUS→JOURNAL: 集中記録が自動で日記に。TASK→JOURNAL: 完了タスクも自動で日記に。", en: "TIMER→TASK: Goals sync automatically. TASK→FOCUS: Tap a task to start focusing. FOCUS→JOURNAL: Focus sessions auto-record. TASK→JOURNAL: Completed tasks auto-record.", zh: "TIMER→TASK：目标自动同步。TASK→FOCUS：点击任务即可集中。FOCUS→JOURNAL：集中记录自动记录。TASK→JOURNAL：完成的任务也自动记录。", ko: "TIMER→TASK: 목표 자동 동기화. TASK→FOCUS: 작업을 탭하여 즉시 집중. FOCUS→JOURNAL: 집중 기록 자동 기록. TASK→JOURNAL: 완료된 작업도 자동 기록." },

  "guide.features": { ja: "特徴", en: "Features", zh: "特点", ko: "특징" },
  "guide.faq": { ja: "よくある質問", en: "FAQ", zh: "常见问题", ko: "자주 묻는 질문" },
  "guide.start": { ja: "ENSOを使い始める", en: "Get started with ENSO", zh: "开始使用ENSO", ko: "ENSO 시작하기" },
  "guide.repeat": { ja: "繰り返す", en: "Repeat", zh: "重复", ko: "반복" },
};
