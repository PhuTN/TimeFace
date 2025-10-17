import {UIFactory} from './abstract';
import {pickTheme} from '../theme/theme';
import {pickLanguage} from '../lang/lang';

/** Light + EN */
export class LightEnFactory implements UIFactory {
  createTheme() {
    return pickTheme('light');
  }
  createLanguage() {
    return pickLanguage('en');
  }
}
