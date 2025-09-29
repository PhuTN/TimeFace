import type { Theme } from "../theme/theme";
import type { LangPath, LangCode } from "../lang/lang";

export interface LanguageResolved {
  code: LangCode;
  idx: 0 | 1;
  t: (path: LangPath) => string;
}

export interface UIFactory {
  createTheme(): Theme;
  createLanguage(): LanguageResolved;
}
