import type { Locale } from "@/types";

export const timerTranslations: Record<string, Record<Locale, string>> = {
  // App identity
  "timer.name": { ja: "ENSO TIMER", en: "ENSO TIMER", zh: "ENSO TIMER", ko: "ENSO TIMER" },
  "timer.tagline": { ja: "円相：人生という時間を可視化するアプリ", en: "Visualize the time called life", zh: "圆相：将人生的时间可视化", ko: "원상: 인생이라는 시간을 시각화하는 앱" },

  // Tabs
  "tabs.life": { ja: "人生", en: "Life", zh: "人生", ko: "인생" },
  "tabs.goals": { ja: "目標", en: "Goals", zh: "目标", ko: "목표" },

  // Life tab
  "life.title": { ja: "人生の残り時間", en: "Time Remaining in Life", zh: "人生剩余时间", ko: "인생의 남은 시간" },
  "life.setup": { ja: "人生の残り時間を設定する", en: "Set up your life timer", zh: "设置人生剩余时间", ko: "인생의 남은 시간을 설정하세요" },
  "life.until": { ja: "歳まで", en: "years old", zh: "岁", ko: "세까지" },
  "life.progress": { ja: "経過", en: "elapsed", zh: "已过", ko: "경과" },
  "life.settings": { ja: "設定", en: "Settings", zh: "设置", ko: "설정" },

  // Goals tab
  "goals.add": { ja: "+ 目標を追加", en: "+ Add Goal", zh: "+ 添加目标", ko: "+ 목표 추가" },
  "goals.empty": { ja: "まだ達成した目標はありません", en: "No achieved goals yet", zh: "还没有已达成的目标", ko: "아직 달성한 목표가 없습니다" },
  "goals.emptyActive": { ja: "目標を設定しよう", en: "Set your first goal", zh: "设定你的第一个目标", ko: "첫 번째 목표를 설정하세요" },
  "goals.emptyActiveHint": { ja: "期限を決めて、やりたいことを目標に", en: "Set a deadline and turn your ambitions into goals", zh: "设定期限，把你的愿望变成目标", ko: "기한을 정하고 꿈을 목표로" },
  "goals.achieveToast": { ja: "目標達成！", en: "Goal achieved!", zh: "目标达成！", ko: "목표 달성!" },
  "goals.confirmDelete": { ja: "本当に削除？", en: "Confirm?", zh: "确认删除？", ko: "정말 삭제?" },
  "goals.openTask": { ja: "TASKで管理", en: "Manage in TASK", zh: "在TASK中管理", ko: "TASK에서 관리" },
  "goals.taskConfirm": { ja: "TASKに移動しますか？", en: "Go to TASK?", zh: "前往TASK？", ko: "TASK로 이동하시겠습니까?" },
  "goals.taskConfirmDesc": { ja: "この目標のタスクを管理・分解できます", en: "Manage and break down tasks for this goal", zh: "管理和分解此目标的任务", ko: "이 목표의 작업을 관리하고 분해할 수 있습니다" },
  "goals.cancel": { ja: "キャンセル", en: "Cancel", zh: "取消", ko: "취소" },
  "goals.goToTask": { ja: "TASKへ", en: "Go to TASK", zh: "前往TASK", ko: "TASK로" },
  "goals.achieved": { ja: "達成リスト", en: "Achieved", zh: "已达成", ko: "달성 목록" },
  "goals.achieve": { ja: "達成", en: "Achieve", zh: "达成", ko: "달성" },
  "goals.edit": { ja: "編集", en: "Edit", zh: "编辑", ko: "편집" },
  "goals.delete": { ja: "削除", en: "Delete", zh: "删除", ko: "삭제" },
  "goals.restore": { ja: "戻す", en: "Restore", zh: "恢复", ko: "복원" },
  "goals.deadline": { ja: "期限", en: "Deadline", zh: "截止", ko: "기한" },
  "goals.overdue": { ja: "期限超過", en: "Overdue", zh: "已过期", ko: "기한 초과" },
  "goals.achievedDate": { ja: "達成日", en: "Achieved on", zh: "达成日期", ko: "달성일" },
  "goals.timeUp": { ja: "時間です！", en: "Time's up!", zh: "时间到！", ko: "시간이 됐습니다!" },

  // Time units
  "time.days": { ja: "日", en: "d", zh: "天", ko: "일" },
  "time.hours": { ja: "時間", en: "h", zh: "小时", ko: "시간" },
  "time.minutes": { ja: "分", en: "m", zh: "分", ko: "분" },
  "time.seconds": { ja: "秒", en: "s", zh: "秒", ko: "초" },
  "time.daysLabel": { ja: "日", en: "Days", zh: "天", ko: "일" },
  "time.hoursLabel": { ja: "時間", en: "Hours", zh: "小时", ko: "시간" },
  "time.minutesLabel": { ja: "分", en: "Min", zh: "分", ko: "분" },
  "time.secondsLabel": { ja: "秒", en: "Sec", zh: "秒", ko: "초" },

  // Notify timings
  "notify.2w": { ja: "2週間前", en: "2w before", zh: "2周前", ko: "2주 전" },
  "notify.1w": { ja: "1週間前", en: "1w before", zh: "1周前", ko: "1주 전" },
  "notify.3d": { ja: "3日前", en: "3d before", zh: "3天前", ko: "3일 전" },
  "notify.1d": { ja: "1日前", en: "1d before", zh: "1天前", ko: "1일 전" },
  "notify.1h": { ja: "1時間前", en: "1h before", zh: "1小时前", ko: "1시간 전" },
  "notify.deadline": { ja: "期限時", en: "At deadline", zh: "截止时", ko: "기한 시" },

  // Goal modals
  "modal.addGoal": { ja: "目標を追加", en: "Add Goal", zh: "添加目标", ko: "목표 추가" },
  "modal.editGoal": { ja: "目標を編集", en: "Edit Goal", zh: "编辑目标", ko: "목표 편집" },
  "modal.goalName": { ja: "目標名", en: "Goal Name", zh: "目标名称", ko: "목표 이름" },
  "modal.goalPlaceholder": { ja: "例: プロダクトリリース", en: "e.g. Product Launch", zh: "例：产品发布", ko: "예: 제품 출시" },
  "modal.deadline": { ja: "達成日", en: "Deadline", zh: "截止日期", ko: "기한" },
  "modal.time": { ja: "時刻（任意）", en: "Time (optional)", zh: "时间（可选）", ko: "시간 (선택)" },
  "modal.notifyTiming": { ja: "通知タイミング", en: "Notification Timing", zh: "通知时间", ko: "알림 타이밍" },
  "modal.customizable": { ja: "カスタム可", en: "customizable", zh: "可自定义", ko: "커스터마이즈 가능" },
  "modal.cancel": { ja: "キャンセル", en: "Cancel", zh: "取消", ko: "취소" },
  "modal.save": { ja: "保存", en: "Save", zh: "保存", ko: "저장" },
  "modal.lifeConfig": { ja: "ライフ設定", en: "Life Settings", zh: "人生设置", ko: "인생 설정" },
  "modal.lifeDesc": { ja: "あなたの人生の残り時間を計算します", en: "Calculate your remaining time in life", zh: "计算你的人生剩余时间", ko: "당신의 인생 남은 시간을 계산합니다" },
  "modal.birthDate": { ja: "生年月日", en: "Date of Birth", zh: "出生日期", ko: "생년월일" },
  "modal.lifeExpectancy": { ja: "想定寿命", en: "Life Expectancy", zh: "预期寿命", ko: "기대 수명" },
  "modal.yearSuffix": { ja: "年", en: "", zh: "年", ko: "년" },
  "modal.monthSuffix": { ja: "月", en: "", zh: "月", ko: "월" },
  "modal.daySuffix": { ja: "日", en: "", zh: "日", ko: "일" },
  "modal.hourSuffix": { ja: "時", en: "h", zh: "时", ko: "시" },
  "modal.minuteSuffix": { ja: "分", en: "m", zh: "分", ko: "분" },
  "modal.ageSuffix": { ja: "歳", en: " yrs", zh: "岁", ko: "세" },

  // Achievement
  "achievement.congrats": { ja: "おめでとう！", en: "Congratulations!", zh: "恭喜！", ko: "축하합니다!" },
  "achievement.achieved": { ja: "目標を達成しました", en: "Goal achieved", zh: "目标已达成", ko: "목표를 달성했습니다" },
  "achievement.memoPlaceholder": { ja: "振り返りメモ（任意）", en: "Reflection memo (optional)", zh: "回顾备注（可选）", ko: "회고 메모 (선택)" },
  "achievement.confirm": { ja: "達成を記録する", en: "Record Achievement", zh: "记录达成", ko: "달성 기록하기" },

  // Life timer settings
  "settings.lifeTimer": { ja: "人生タイマー", en: "Life Timer", zh: "人生计时器", ko: "인생 타이머" },
  "settings.setTo": { ja: "歳まで設定中", en: "years set", zh: "岁已设置", ko: "세까지 설정됨" },
};
