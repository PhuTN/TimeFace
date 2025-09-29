import React from "react";
import { getUIFactory } from "./selector";
import type { Theme } from "../theme/theme";
import type { LanguageResolved } from "./abstract";

/** Hook trả { loading, theme, lang } */
export function useUIFactory() {
  const [state, setState] = React.useState<{
    loading: boolean;
    theme?: Theme;
    lang?: LanguageResolved;
  }>({ loading: true });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const factory = await getUIFactory();
      const theme = factory.createTheme();
      const lang  = factory.createLanguage();
      if (mounted) setState({ loading: false, theme, lang });
    })();
    return () => { mounted = false; };
  }, []);

  return state;
}
