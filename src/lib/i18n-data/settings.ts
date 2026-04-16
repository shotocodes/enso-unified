import type { Locale } from "@/types";

// 統一設定ページ用の翻訳キー
export const settingsTranslations: Record<string, Record<Locale, string>> = {
  "settings.title": { ja: "設定", en: "Settings", zh: "设置", ko: "설정" },
  "settings.back": { ja: "戻る", en: "Back", zh: "返回", ko: "뒤로" },

  // Sections
  "settings.section.appearance": { ja: "外観", en: "Appearance", zh: "外观", ko: "외관" },
  "settings.section.appearance.desc": { ja: "テーマ・言語の設定", en: "Theme and language", zh: "主题和语言", ko: "테마와 언어" },
  "settings.section.focus": { ja: "フォーカス", en: "Focus", zh: "专注", ko: "집중" },
  "settings.section.focus.desc": { ja: "ENSO FOCUSのポモドーロ・完了音・1日の目標", en: "Pomodoro, completion sound, and daily goal for ENSO FOCUS", zh: "ENSO FOCUS的番茄钟、完成音和每日目标", ko: "ENSO FOCUS의 포모도로, 완료음, 일일 목표" },
  "settings.section.ambient": { ja: "環境音", en: "Ambient Sound", zh: "环境音", ko: "환경음" },
  "settings.section.ambient.desc": { ja: "ENSO FOCUSで集中中に流れるBGM（雨音・焚き火など）", en: "Background sounds played during focus sessions in ENSO FOCUS", zh: "ENSO FOCUS专注时播放的背景音（雨声、篝火等）", ko: "ENSO FOCUS 집중 중 재생되는 배경음 (빗소리·모닥불 등)" },
  "settings.section.timer": { ja: "タイマーの音", en: "Tick Sound", zh: "秒针声音", ko: "초침 소리" },
  "settings.section.timer.desc": { ja: "ENSO TIMERで秒針の音をON/OFF", en: "Toggle ticking sound in ENSO TIMER", zh: "在ENSO TIMER中开关秒针声", ko: "ENSO TIMER에서 초침 소리 켜기/끄기" },
  "settings.section.notifications": { ja: "通知", en: "Notifications", zh: "通知", ko: "알림" },
  "settings.section.notifications.desc": { ja: "ENSO TIMERの目標期限が近づいた時に通知", en: "Get notified when goals approach their deadline in ENSO TIMER", zh: "ENSO TIMER中目标接近截止时通知", ko: "ENSO TIMER의 목표 기한이 다가올 때 알림" },
  "settings.section.categories": { ja: "カテゴリ", en: "Categories", zh: "分类", ko: "카테고리" },
  "settings.section.categories.desc": { ja: "ENSO FOCUSで集中セッションを分類するタグ", en: "Tags for classifying focus sessions in ENSO FOCUS", zh: "ENSO FOCUS中专注会话的分类标签", ko: "ENSO FOCUS에서 집중 세션을 분류하는 태그" },
  "settings.section.life": { ja: "人生タイマー", en: "Life Timer", zh: "人生计时器", ko: "인생 타이머" },
  "settings.section.life.desc": { ja: "ENSO TIMERで人生の残り時間を可視化", en: "Visualize remaining lifetime in ENSO TIMER", zh: "在ENSO TIMER中可视化剩余人生时间", ko: "ENSO TIMER에서 남은 인생 시간을 시각화" },
  "settings.section.data": { ja: "データ", en: "Data", zh: "数据", ko: "데이터" },
  "settings.section.data.desc": { ja: "全アプリのデータをエクスポート/インポート/削除", en: "Export, import, or delete data across all apps", zh: "导出、导入或删除所有应用数据", ko: "모든 앱 데이터의 내보내기/가져오기/삭제" },
  "settings.section.about": { ja: "About", en: "About", zh: "关于", ko: "정보" },

  "settings.theme": { ja: "テーマ", en: "Theme", zh: "主题", ko: "테마" },
  "settings.language": { ja: "言語", en: "Language", zh: "语言", ko: "언어" },

  // Focus settings
  "settings.focusDuration": { ja: "集中時間", en: "Focus Duration", zh: "专注时长", ko: "집중 시간" },
  "settings.breakDuration": { ja: "休憩時間", en: "Break Duration", zh: "休息时长", ko: "휴식 시간" },
  "settings.autoStartBreak": { ja: "休憩を自動開始", en: "Auto-start Break", zh: "自动开始休息", ko: "자동 휴식 시작" },
  "settings.completionSound": { ja: "完了音", en: "Completion Sound", zh: "完成音", ko: "완료 소리" },
  "settings.dailyGoal": { ja: "1日の目標", en: "Daily Goal", zh: "每日目标", ko: "일일 목표" },
  "settings.goalOff": { ja: "なし", en: "Off", zh: "关闭", ko: "없음" },

  // Ambient
  "settings.ambientEnable": { ja: "環境音を有効化", en: "Enable Ambient Sound", zh: "启用环境音", ko: "환경음 활성화" },
  "settings.ambientType": { ja: "環境音の種類", en: "Sound Type", zh: "环境音类型", ko: "환경음 종류" },
  "settings.ambientVolume": { ja: "環境音の音量", en: "Volume", zh: "环境音音量", ko: "음량" },

  // Timer (tick sound)
  "settings.tickEnable": { ja: "秒針の音", en: "Tick Sound", zh: "秒针声音", ko: "초침 소리" },
  "settings.tickType": { ja: "音の種類", en: "Sound Type", zh: "声音类型", ko: "소리 종류" },
  "settings.tickVolume": { ja: "音量", en: "Volume", zh: "音量", ko: "음량" },

  // Notifications
  "settings.notifEnabled": { ja: "通知は有効です", en: "Notifications enabled", zh: "通知已启用", ko: "알림이 활성화되었습니다" },
  "settings.notifBlocked": { ja: "通知はブロックされています", en: "Notifications blocked", zh: "通知已被阻止", ko: "알림이 차단되었습니다" },
  "settings.notifAsk": { ja: "通知を有効にしますか？", en: "Enable notifications?", zh: "启用通知？", ko: "알림을 활성화하시겠습니까?" },
  "settings.enable": { ja: "有効にする", en: "Enable", zh: "启用", ko: "활성화" },
  "settings.notifUnsupported": { ja: "このブラウザは通知に対応していません", en: "This browser doesn't support notifications", zh: "此浏览器不支持通知", ko: "이 브라우저는 알림을 지원하지 않습니다" },

  // Life timer
  "settings.lifeTimer": { ja: "人生タイマー", en: "Life Timer", zh: "人生计时器", ko: "인생 타이머" },
  "settings.setTo": { ja: "歳まで設定中", en: "years set", zh: "岁已设置", ko: "세까지 설정됨" },
  "settings.lifeEdit": { ja: "編集", en: "Edit", zh: "编辑", ko: "편집" },
  "settings.lifeSet": { ja: "設定する", en: "Set Up", zh: "设置", ko: "설정" },

  // Data
  "settings.data": { ja: "データ", en: "Data", zh: "数据", ko: "데이터" },
  "settings.dataDesc": { ja: "全アプリのデータを1ファイルにエクスポート/インポートできます", en: "Export or import all app data as a single file", zh: "将所有应用的数据导出/导入为单个文件", ko: "모든 앱 데이터를 단일 파일로 내보내기/가져오기" },
  "settings.export": { ja: "エクスポート", en: "Export", zh: "导出", ko: "내보내기" },
  "settings.import": { ja: "インポート", en: "Import", zh: "导入", ko: "가져오기" },
  "settings.importSuccess": { ja: "インポート成功！再読み込みします...", en: "Import successful! Reloading...", zh: "导入成功！正在重新加载...", ko: "가져오기 성공! 다시 로드 중..." },
  "settings.importFail": { ja: "インポートに失敗しました", en: "Import failed", zh: "导入失败", ko: "가져오기 실패" },
  "settings.clear": { ja: "すべてのデータを削除", en: "Delete All Data", zh: "删除所有数据", ko: "모든 데이터 삭제" },
  "settings.clearConfirm": { ja: "すべてのデータが削除されます。この操作は取り消せません。", en: "All data will be deleted. This cannot be undone.", zh: "所有数据将被删除。此操作无法撤消。", ko: "모든 데이터가 삭제됩니다. 이 작업은 취소할 수 없습니다." },

  // About
  "settings.version": { ja: "Version", en: "Version", zh: "Version", ko: "Version" },
  "settings.credits": { ja: "Credits", en: "Credits", zh: "Credits", ko: "Credits" },
  "settings.openGuide": { ja: "使い方ガイドを見る", en: "View Guide", zh: "查看指南", ko: "가이드 보기" },
};
