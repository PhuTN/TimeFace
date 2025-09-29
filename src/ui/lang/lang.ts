

export const LangCodes = ["vi", "en"] as const;
export type LangCode  = typeof LangCodes[number];
export type LangIndex = 0 | 1;

export function langToIndex(code: LangCode): LangIndex {
  return (LangCodes.indexOf(code) as LangIndex) ?? 0;
}

// Các path hợp lệ: key top-level hoặc "theme.light"/"theme.dark"
export type LangPath =
  | keyof Omit<typeof Lang, "theme">
  | `theme.${"light" | "dark"}`;

// t("hello", "vi") hoặc t("theme.light", 1)
export function t(path: LangPath, lang: LangCode | LangIndex): string {
  const idx: LangIndex = typeof lang === "number" ? lang : langToIndex(lang);
  if (path.startsWith("theme.")) {
    const key = path.split(".")[1] as "light" | "dark";
    return Lang.theme[key][idx];
  }
  const k = path as keyof Omit<typeof Lang, "theme">;

  return Lang[k][idx];
}

// Trả về đối tượng đã resolve sẵn + helper t()
export function pickLanguage(code: LangCode) {
  const idx = langToIndex(code);
  return {
    code,
    idx,
    t: (path: LangPath) => t(path, idx),
  };
}


// [0] = vi, [1] = en
export const Lang = {
  hello:   ["Xin chào", "Hello"],
  logout:  ["Đăng xuất", "Logout"],
  settings:["Cài đặt", "Settings"],
  profile: ["Hồ sơ", "Profile"],   // <- thêm từ mới chỉ cần thêm 1 dòng ở đây
  rank:    ["Xếp hạng", "Ranking"],
  theme: {
    light: ["Chủ đề sáng", "Light theme"],
    dark:  ["Chủ đề tối",  "Dark theme"],
  },
} as const;