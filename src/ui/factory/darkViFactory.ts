import {UIFactory} from './abstract';
import {pickTheme} from '../theme/theme';
import {pickLanguage} from '../lang/lang';

/** Dark + VI */
export class DarkViFactory implements UIFactory {
  createTheme() {
    return pickTheme('dark');
  }
  createLanguage() {
    return pickLanguage('vi');
  }
}
