import type { Locale } from "@/types";

export const authTranslations: Record<string, Record<Locale, string>> = {
  "auth.back": { ja: "戻る", en: "Back", zh: "返回", ko: "뒤로" },
  "auth.signInTitle": { ja: "ログインしてクラウドに同期", en: "Sign in to sync to the cloud", zh: "登录以同步到云端", ko: "로그인하여 클라우드에 동기화" },
  "auth.signInDesc": {
    ja: "Googleアカウントでログインすると、データが全デバイスで同期されます。未ログインのままでも全機能をお使いいただけます。",
    en: "Sign in with Google to sync your data across all devices. You can use ENSO without signing in — all features work offline.",
    zh: "使用Google账号登录可在所有设备间同步数据。也可以不登录使用，所有功能支持离线。",
    ko: "Google 계정으로 로그인하면 모든 기기에서 데이터가 동기화됩니다. 로그인하지 않아도 모든 기능을 사용할 수 있습니다.",
  },
  "auth.googleSignIn": { ja: "Googleでログイン", en: "Sign in with Google", zh: "使用Google登录", ko: "Google로 로그인" },
  "auth.signingIn": { ja: "ログイン中...", en: "Signing in...", zh: "登录中...", ko: "로그인 중..." },
  "auth.privacyNote": {
    ja: "メールアドレス以外の情報は取得しません。データはお客様専用でRLSで保護されます。",
    en: "We only store your email. Your data is isolated by row-level security.",
    zh: "我们只存储您的电子邮件。您的数据通过行级安全隔离。",
    ko: "이메일만 저장합니다. 데이터는 행 수준 보안으로 격리됩니다.",
  },

  // Settings account section
  "settings.section.account": { ja: "アカウント", en: "Account", zh: "账户", ko: "계정" },
  "settings.section.account.desc": { ja: "Googleログインでデバイス間のデータ同期", en: "Sign in with Google to sync data across devices", zh: "使用Google登录以跨设备同步数据", ko: "Google 로그인으로 기기 간 데이터 동기화" },
  "settings.notSignedIn": { ja: "未ログイン（ローカルデータのみ）", en: "Not signed in — local data only", zh: "未登录 — 仅本地数据", ko: "로그인하지 않음 — 로컬 데이터만" },
  "settings.signIn": { ja: "Googleでログイン", en: "Sign in with Google", zh: "使用Google登录", ko: "Google로 로그인" },
  "settings.signOut": { ja: "ログアウト", en: "Sign out", zh: "登出", ko: "로그아웃" },
  "settings.signedInAs": { ja: "ログイン中:", en: "Signed in as", zh: "已登录:", ko: "로그인됨:" },

  // Dashboard sync banner
  "sync.banner.title": { ja: "クラウド同期で全デバイス対応", en: "Sync across all your devices", zh: "跨设备云同步", ko: "모든 기기에서 동기화" },
  "sync.banner.desc": { ja: "Googleログインで別端末でも同じデータ", en: "Sign in with Google to access your data anywhere", zh: "用Google登录随时随地访问数据", ko: "Google 로그인으로 어디서나 데이터 접근" },
  "sync.banner.cta": { ja: "ログイン", en: "Sign in", zh: "登录", ko: "로그인" },
};
