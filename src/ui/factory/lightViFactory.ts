import { UIFactory } from "./abstract";
import { pickTheme } from "../theme/theme";
import { pickLanguage } from "../lang/lang";

/** Light + VI */
export class LightViFactory implements UIFactory {
  createTheme() { return pickTheme("light"); }
  createLanguage() { return pickLanguage("vi"); }
}
