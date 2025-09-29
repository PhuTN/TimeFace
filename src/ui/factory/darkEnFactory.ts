import { UIFactory } from "./abstract";
import { pickTheme } from "../theme/theme";
import { pickLanguage } from "../lang/lang";

/** Dark + EN */
export class DarkEnFactory implements UIFactory {
  createTheme() { return pickTheme("dark"); }
  createLanguage() { return pickLanguage("en"); }
}
