import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ThemeKey} from '../theme/theme';
import type {LangCode} from '../lang/lang';
import type {UIFactory} from './abstract';

import {LightViFactory} from './lightViFactory';
import {LightEnFactory} from './lightEnFactory';
import {DarkViFactory} from './darkViFactory';
import {DarkEnFactory} from './darkEnFactory';

const THEME_KEY = 'ui.theme'; // "light" | "dark"
const LANG_KEY = 'ui.lang'; // "vi" | "en"

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
  const theme = (await AsyncStorage.getItem(THEME_KEY)) as ThemeKey | null;
  const lang = (await AsyncStorage.getItem(LANG_KEY)) as LangCode | null;

  const t: ThemeKey = theme === 'dark' ? 'dark' : 'light';
  const l: LangCode = lang === 'en' ? 'en' : 'vi';

  if (t === 'light' && l === 'vi') {return new LightViFactory();}
  if (t === 'light' && l === 'en') {return new LightEnFactory();}
  if (t === 'dark' && l === 'vi') {return new DarkViFactory();}
  return new DarkEnFactory();
}

/** Ghi AsyncStorage và phát sự kiện đổi UI để hook re-load */
export async function setUIState(next: {theme?: ThemeKey; lang?: LangCode}) {
  if (next.theme) {await AsyncStorage.setItem(THEME_KEY, next.theme);}
  if (next.lang) {await AsyncStorage.setItem(LANG_KEY, next.lang);}
  emitUIChange();
}
