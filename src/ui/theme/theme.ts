export const ThemeModes = ['light', 'dark'] as const;
export type ThemeKey = (typeof ThemeModes)[number];
export type ThemeIndex = 0 | 1;

export type Theme = {
  name: 'light' | 'dark';
  colors: Record<string, string>; // map động từ ThemePack.colors
  tokens: Record<string, number>; // map động từ ThemePack.tokens
  spacing: (n: number) => number; // dùng tokens.spacingBase (fallback 8)
};

export function themeToIndex(key: ThemeKey): ThemeIndex {
  return (ThemeModes.indexOf(key) as ThemeIndex) ?? 0;
}

/** Build Theme động từ ThemePack (không hard-code key) */
export function pickTheme(mode: ThemeKey): Theme {
  const i = themeToIndex(mode);

  const colors = Object.fromEntries(
    Object.entries(ThemePack.colors).map(([k, tuple]) => [
      k,
      (tuple as readonly string[])[i],
    ]),
  );

  const tokens = Object.fromEntries(
    Object.entries(ThemePack.tokens).map(([k, tuple]) => [
      k,
      (tuple as readonly number[])[i],
    ]),
  );

  const spacingBase = (tokens.spacingBase ?? 8) as number;

  return {
    name: mode,
    colors,
    tokens,
    spacing: (n: number) => n * spacingBase,
  };
}

// [0] = light, [1] = dark
// ✅ Thêm màu/token mới = chỉ thêm 1 dòng dưới đây
export const ThemePack = {
  colors: {
    background: ['#FFFFFF', '#000000'],
    text: ['#111111', '#FFFFFF'],
    primary: ['#1976d2', '#90CAF9'],
    secondary: ['#E3F2FD', '#0D47A1'],
    border: ['#EAEAEA', '#1F1F1F'],
    danger: ['#E53935', '#EF5350'],

    greyText: ['#333', '#AAAAAA'],
    filterChipBackground: ['#C0F0F0', '#4A90E2'],
    filterChipText: ['#999999', '#CCCCCC'],

    borderLight: ['#D9D9D9', '#666666'],
    approved: ['#54FE70', '#2E8B57'],
    rejected: ['#FF4B4B', '#B22222'],
    pending: ['#D9FE54', '#FFD700'],
    mutedText: ['#666666', '#CCCCCC'],
    background: ['#FFFFFF', '#000000'],
    text: ['#111111', '#FFFFFF'],
    primary: ['#1976d2', '#90CAF9'],
    secondary: ['#E3F2FD', '#0D47A1'],
    border: ['#EAEAEA', '#1F1F1F'],
    danger: ['#E53935', '#EF5350'],
    contrastBackground: ['#000000', '#FFFFFF'],
    placeholder: ['#808080', '#808080'],
    // accent:     ["#FF8A00", "#FFB74D"], // ví dụ thêm 1 dòng
  },
  tokens: {
    spacingBase: [8, 8],
    radius: [12, 12],
    // elevation:   [2, 6], // ví dụ thêm 1 dòng
  },
} as const;
