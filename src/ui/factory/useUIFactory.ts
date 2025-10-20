import React from 'react';
import {getUIFactory, subscribeUIChange} from './selector';
import type {Theme} from '../theme/theme';
import type {LanguageResolved} from './abstract';

/** Hook trả { loading, theme, lang } và tự reload khi setUIState() */
export function useUIFactory() {
  const [state, setState] = React.useState<{
    loading: boolean;
    theme?: Theme;
    lang?: LanguageResolved;
  }>({loading: true});

  const load = React.useCallback(async () => {
    const factory = await getUIFactory();
    const theme = factory.createTheme();
    const lang = factory.createLanguage();
    setState({loading: false, theme, lang});

    // Debug log cho bạn kiểm tra:
    console.log('[UIFactory] theme =', theme.name, theme.colors);
    console.log('[UIFactory] lang  =', lang.code);
  }, []);

  React.useEffect(() => {
    // load lần đầu
    load();

    // lắng nghe sự kiện đổi UI
    const unsubscribe = subscribeUIChange(() => {
      load();
    });

    return () => {
      unsubscribe();
    };
  }, [load]);

  return state;
}
