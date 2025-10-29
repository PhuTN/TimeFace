import type {ThemeKey} from '../theme/theme';
import type {LangCode} from '../lang/lang';
import type {UIFactory} from './abstract';

import {LightViFactory} from './lightViFactory';
import {LightEnFactory} from './lightEnFactory';
import {DarkViFactory} from './darkViFactory';
import {DarkEnFactory} from './darkEnFactory';

// In‑memory UI state (no persistence) as requested
let currentTheme: ThemeKey = 'light';
let currentLang: LangCode = 'vi';

/* ------------------------- Tiny Event Bus ------------------------- */
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeUIChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emitUIChange() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (_) {}
  });
}
/* ----------------------------------------------------------------- */

/** Chọn Concrete Factory theo state lưu trong AsyncStorage */
export async function getUIFactory(): Promise<UIFactory> {
  const t = currentTheme;
  const l = currentLang;
  if (t === 'light' && l === 'vi') {return new LightViFactory();}
  if (t === 'light' && l === 'en') {return new LightEnFactory();}
  if (t === 'dark' && l === 'vi') {return new DarkViFactory();}
  return new DarkEnFactory();
}

/** Ghi AsyncStorage và phát sự kiện đổi UI để hook re-load */
export async function setUIState(next: {theme?: ThemeKey; lang?: LangCode}) {
  if (next.theme) { currentTheme = next.theme; }
  if (next.lang) { currentLang = next.lang; }
  emitUIChange();
}
