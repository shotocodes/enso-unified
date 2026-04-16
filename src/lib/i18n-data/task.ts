import type { Locale } from "@/types";

export const taskTranslations: Record<string, Record<Locale, string>> = {
  // App identity
  "task.name": { ja: "ENSO TASK", en: "ENSO TASK", zh: "ENSO TASK", ko: "ENSO TASK" },
  "task.tagline": { ja: "目標を、行動に変える", en: "Turn goals into action", zh: "将目标转化为行动", ko: "목표를 행동으로" },

  // Tabs
  "tabs.tasks": { ja: "タスク", en: "Tasks", zh: "任务", ko: "작업" },

  // Tasks list
  "tasks.title": { ja: "タスク", en: "Tasks", zh: "任务", ko: "작업" },
  "tasks.today": { ja: "今日のタスク", en: "Today's Tasks", zh: "今天的任务", ko: "오늘의 작업" },
  "tasks.all": { ja: "すべてのタスク", en: "All Tasks", zh: "所有任务", ko: "모든 작업" },
  "tasks.completed": { ja: "完了済み", en: "Completed", zh: "已完成", ko: "완료됨" },
  "tasks.add": { ja: "+ タスク追加", en: "+ Add Task", zh: "+ 添加任务", ko: "+ 작업 추가" },
  "tasks.empty": { ja: "タスクがありません", en: "No tasks yet", zh: "暂无任务", ko: "작업이 없습니다" },
  "tasks.emptyHint": { ja: "「+ タスク追加」で始めましょう", en: "Tap \"+ Add Task\" to get started", zh: "点击\"+ 添加任务\"开始", ko: "\"+ 작업 추가\"를 눌러 시작하세요" },
  "tasks.count": { ja: "{0}/{1}", en: "{0}/{1}", zh: "{0}/{1}", ko: "{0}/{1}" },
  "tasks.uncategorized": { ja: "未分類", en: "Uncategorized", zh: "未分类", ko: "미분류" },
  "tasks.noMilestone": { ja: "マイルストーンなし", en: "No Milestone", zh: "无里程碑", ko: "마일스톤 없음" },
  "tasks.focusPrompt": { ja: "「{0}」に集中する？", en: "Focus on \"{0}\"?", zh: "集中于「{0}」？", ko: "\"{0}\"에 집중하시겠습니까?" },
  "tasks.openFocus": { ja: "ENSO FOCUSで集中 →", en: "Focus with ENSO FOCUS →", zh: "用ENSO FOCUS集中 →", ko: "ENSO FOCUS로 집중 →" },
  "tasks.close": { ja: "閉じる", en: "Close", zh: "关闭", ko: "닫기" },

  // Task modals
  "task.add.title": { ja: "タスクを追加", en: "Add Task", zh: "添加任务", ko: "작업 추가" },
  "task.edit.title": { ja: "タスクを編集", en: "Edit Task", zh: "编辑任务", ko: "작업 편집" },
  "task.title": { ja: "タイトル", en: "Title", zh: "标题", ko: "제목" },
  "task.title.placeholder": { ja: "例: API設計書を書く", en: "e.g. Write API spec", zh: "例如: 编写API规范", ko: "예: API 설계서 작성" },
  "task.priority": { ja: "優先度", en: "Priority", zh: "优先级", ko: "우선순위" },
  "task.priority.high": { ja: "高", en: "High", zh: "高", ko: "높음" },
  "task.priority.medium": { ja: "中", en: "Medium", zh: "中", ko: "중간" },
  "task.priority.low": { ja: "低", en: "Low", zh: "低", ko: "낮음" },
  "task.dueDate": { ja: "期日", en: "Due Date", zh: "截止日期", ko: "마감일" },
  "task.save": { ja: "追加する", en: "Add", zh: "添加", ko: "추가하기" },
  "task.update": { ja: "保存する", en: "Save", zh: "保存", ko: "저장하기" },
  "task.goal": { ja: "目標", en: "Goal", zh: "目标", ko: "목표" },
  "task.goal.none": { ja: "なし", en: "None", zh: "无", ko: "없음" },
  "task.milestone": { ja: "マイルストーン", en: "Milestone", zh: "里程碑", ko: "마일스톤" },
  "task.milestone.none": { ja: "なし", en: "None", zh: "无", ko: "없음" },

  // Goals (TASK version — milestones & breakdown)
  "goals.fromTimer": { ja: "ENSO TIMERの目標", en: "Goals from ENSO TIMER", zh: "来自ENSO TIMER的目标", ko: "ENSO TIMER의 목표" },
  "goals.noGoals": { ja: "目標がありません", en: "No goals yet", zh: "暂无目标", ko: "목표가 없습니다" },
  "goals.noGoalsHint": { ja: "ENSO TIMERで目標を設定しましょう", en: "Set goals in ENSO TIMER", zh: "在ENSO TIMER中设置目标", ko: "ENSO TIMER에서 목표를 설정하세요" },
  "goals.remaining": { ja: "残り{0}日", en: "{0}d left", zh: "剩余{0}天", ko: "{0}일 남음" },
  "goals.milestones": { ja: "マイルストーン", en: "Milestones", zh: "里程碑", ko: "마일스톤" },
  "goals.addMilestone": { ja: "+ マイルストーン追加", en: "+ Add Milestone", zh: "+ 添加里程碑", ko: "+ 마일스톤 추가" },
  "goals.milestone.placeholder": { ja: "例: TOEIC模試を受ける", en: "e.g. Take TOEIC mock test", zh: "例如: 参加TOEIC模拟考试", ko: "예: TOEIC 모의고사 응시" },
  "goals.addTask": { ja: "+ タスク", en: "+ Task", zh: "+ 任务", ko: "+ 작업" },
  "goals.moveToTasks": { ja: "タスクに移行", en: "Move to Tasks", zh: "移至任务", ko: "작업으로 이동" },
  "goals.taskCount": { ja: "{0}件のタスク", en: "{0} tasks", zh: "{0}个任务", ko: "{0}개 작업" },
  "goals.selectTasks": { ja: "移行するタスクを選択", en: "Select tasks to move", zh: "选择要移动的任务", ko: "이동할 작업 선택" },
  "goals.inTasks": { ja: "移行済み", en: "Active", zh: "已移动", ko: "이동됨" },
  "goals.editMilestone": { ja: "編集", en: "Edit", zh: "编辑", ko: "편집" },
  "goals.deleteMilestone": { ja: "削除", en: "Delete", zh: "删除", ko: "삭제" },
  "goals.deleteMilestoneConfirm": { ja: "このマイルストーンを削除しますか？紐づくタスクも削除されます。", en: "Delete this milestone? Related tasks will also be deleted.", zh: "删除此里程碑？相关任务也将被删除。", ko: "이 마일스톤을 삭제하시겠습니까? 관련 작업도 삭제됩니다." },
  "goals.aiGenerate": { ja: "AIで分解", en: "AI Breakdown", zh: "AI分解", ko: "AI 분해" },
  "goals.aiGenerating": { ja: "AI生成中...", en: "Generating...", zh: "AI生成中...", ko: "AI 생성 중..." },
  "goals.aiError": { ja: "生成に失敗しました", en: "Generation failed", zh: "生成失败", ko: "생성 실패" },
  "goals.aiConfirm": { ja: "この内容で追加しますか？", en: "Add these items?", zh: "添加这些内容？", ko: "이 내용을 추가하시겠습니까?" },
  "goals.aiAdd": { ja: "追加する", en: "Add All", zh: "全部添加", ko: "모두 추가" },
  "goals.openTimer": { ja: "ENSO TIMERを開く →", en: "Open ENSO TIMER →", zh: "打开ENSO TIMER →", ko: "ENSO TIMER 열기 →" },

  // Modal
  "modal.confirm": { ja: "確認", en: "Confirm", zh: "确认", ko: "확인" },
  "modal.cancel": { ja: "キャンセル", en: "Cancel", zh: "取消", ko: "취소" },
  "modal.delete": { ja: "削除する", en: "Delete", zh: "删除", ko: "삭제" },
};
