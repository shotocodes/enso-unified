import type { Locale } from "@/types";

export const journalTranslations: Record<string, Record<Locale, string>> = {
  // App identity
  "journal.name": { ja: "ENSO JOURNAL", en: "ENSO JOURNAL", zh: "ENSO JOURNAL", ko: "ENSO JOURNAL" },
  "journal.tagline": { ja: "やったことが、勝手に日記になる", en: "Your actions become your journal", zh: "你的行动自动成为日记", ko: "행동이 자동으로 일기가 됩니다" },

  // Tabs
  "tabs.today": { ja: "今日", en: "Today", zh: "今天", ko: "오늘" },
  "tabs.timeline": { ja: "タイムライン", en: "Timeline", zh: "时间线", ko: "타임라인" },

  // Today
  "today.streak": { ja: "{0}日", en: "{0}d", zh: "{0}天", ko: "{0}일" },
  "today.flashback": { ja: "去年の今日", en: "This day last year", zh: "去年的今天", ko: "작년 오늘" },
  "today.flashback2": { ja: "一昨年の今日", en: "This day 2 years ago", zh: "前年的今天", ko: "재작년 오늘" },
  "today.flashback.empty": { ja: "来年、ここにあなたの記録が表示されます", en: "Next year, your entry will appear here", zh: "明年，你的记录将显示在这里", ko: "내년에 여기에 기록이 표시됩니다" },
  "today.flashback.first": { ja: "来年の今日、この日を振り返りましょう", en: "Next year, you'll look back on today", zh: "明年的今天，回顾这一天", ko: "내년 오늘, 이 날을 돌아봅시다" },
  "today.activity": { ja: "今日のアクティビティ", en: "Today's Activity", zh: "今天的活动", ko: "오늘의 활동" },
  "today.addEntry": { ja: "+ 追加", en: "+ Add", zh: "+ 添加", ko: "+ 추가" },
  "today.noActivity": { ja: "まだ記録がありません", en: "No entries yet", zh: "暂无记录", ko: "기록이 없습니다" },
  "today.noActivityHint": { ja: "「+ 追加」で今日の行動を記録しましょう", en: "Tap \"+ Add\" to log your activities", zh: "点击\"+ 添加\"记录今天的活动", ko: "\"+ 추가\"를 눌러 오늘의 활동을 기록하세요" },
  "today.openFocus": { ja: "ENSO FOCUSで集中を始める →", en: "Start focusing with ENSO FOCUS →", zh: "用ENSO FOCUS开始集中 →", ko: "ENSO FOCUS로 집중 시작 →" },
  "today.openTask": { ja: "ENSO TASKでタスクを追加 →", en: "Add tasks with ENSO TASK →", zh: "用ENSO TASK添加任务 →", ko: "ENSO TASK로 작업 추가 →" },
  "today.comment": { ja: "ひとこと", en: "Quick Note", zh: "一句话", ko: "한마디" },
  "today.comment.morning": { ja: "今日の目標は？", en: "What's your goal today?", zh: "今天的目标是什么？", ko: "오늘의 목표는?" },
  "today.comment.afternoon": { ja: "午前中はどうでした？", en: "How was your morning?", zh: "上午怎么样？", ko: "오전은 어땠나요?" },
  "today.comment.evening": { ja: "今日を一言で表すなら？", en: "Sum up your day in a word?", zh: "用一句话总结今天？", ko: "오늘을 한마디로 표현하면?" },
  "today.comment.night": { ja: "おつかれさまでした", en: "Good job today", zh: "辛苦了", ko: "수고하셨어요" },
  "today.mood": { ja: "今日の気分", en: "Today's Mood", zh: "今天的心情", ko: "오늘의 기분" },
  "today.mood.1": { ja: "つらい", en: "Tough", zh: "很难", ko: "힘듦" },
  "today.mood.2": { ja: "まあまあ", en: "Okay", zh: "一般", ko: "그저 그래" },
  "today.mood.3": { ja: "ふつう", en: "Normal", zh: "普通", ko: "보통" },
  "today.mood.4": { ja: "いい感じ", en: "Good", zh: "不错", ko: "좋은" },
  "today.mood.5": { ja: "最高！", en: "Great!", zh: "太棒了！", ko: "최고!" },
  "today.notes": { ja: "今日のまとめ", en: "Today's Notes", zh: "今日总结", ko: "오늘의 정리" },
  "today.addNote": { ja: "+ メモ", en: "+ Note", zh: "+ 备注", ko: "+ 메모" },
  "today.notesHint": { ja: "「+ メモ」で今日の気づきを書き留めよう", en: "Tap \"+ Note\" to capture your thoughts", zh: "点击\"+ 备注\"记下今天的想法", ko: "\"+ 메모\"를 눌러 오늘의 생각을 적어보세요" },
  "today.generateAi": { ja: "AIで日記を生成", en: "Generate with AI", zh: "AI生成日记", ko: "AI로 일기 생성" },
  "today.aiGenerating": { ja: "生成中...", en: "Generating...", zh: "生成中...", ko: "생성 중..." },
  "today.autosaved": { ja: "自動保存済み ✓", en: "Auto-saved ✓", zh: "已自动保存 ✓", ko: "자동 저장됨 ✓" },
  "today.focusCTA": { ja: "ENSO FOCUSで集中を記録しよう", en: "Track focus with ENSO FOCUS", zh: "使用ENSO FOCUS记录专注", ko: "ENSO FOCUS로 집중을 기록하세요" },

  // Entry icons
  "entry.focus": { ja: "集中", en: "Focus", zh: "专注", ko: "집중" },
  "entry.done": { ja: "完了", en: "Done", zh: "完成", ko: "완료" },
  "entry.memo": { ja: "メモ", en: "Memo", zh: "备忘", ko: "메모" },
  "entry.idea": { ja: "アイデア", en: "Idea", zh: "想法", ko: "아이디어" },

  // Entry modal
  "entry.add.title": { ja: "アクティビティを追加", en: "Add Activity", zh: "添加活动", ko: "활동 추가" },
  "entry.add.time": { ja: "時刻", en: "Time", zh: "时间", ko: "시각" },
  "entry.add.text": { ja: "内容", en: "What did you do?", zh: "做了什么？", ko: "무엇을 했나요?" },
  "entry.add.placeholder": { ja: "例: React開発、ミーティング...", en: "e.g. React coding, Meeting...", zh: "例如: React开发, 会议...", ko: "예: React 개발, 미팅..." },
  "entry.add.icon": { ja: "種類", en: "Type", zh: "类型", ko: "유형" },
  "entry.add.save": { ja: "追加する", en: "Add", zh: "添加", ko: "추가하기" },
  "entry.edit.title": { ja: "アクティビティを編集", en: "Edit Activity", zh: "编辑活动", ko: "활동 편집" },
  "entry.edit.save": { ja: "保存する", en: "Save", zh: "保存", ko: "저장하기" },

  // Timeline
  "timeline.title": { ja: "タイムライン", en: "Timeline", zh: "时间线", ko: "타임라인" },
  "timeline.empty": { ja: "まだ日記がありません", en: "No journals yet", zh: "暂无日记", ko: "아직 일기가 없습니다" },
  "timeline.emptyHint": { ja: "今日タブで最初の記録を始めましょう", en: "Start your first entry in the Today tab", zh: "在今天标签开始你的第一条记录", ko: "오늘 탭에서 첫 기록을 시작하세요" },
  "timeline.search": { ja: "検索...", en: "Search...", zh: "搜索...", ko: "검색..." },
  "timeline.all": { ja: "すべて", en: "All", zh: "全部", ko: "전체" },
  "timeline.entries": { ja: "{0}件", en: "{0}", zh: "{0}条", ko: "{0}건" },
  "timeline.activities": { ja: "{0}件のアクティビティ", en: "{0} activities", zh: "{0}项活动", ko: "{0}개의 활동" },
};
