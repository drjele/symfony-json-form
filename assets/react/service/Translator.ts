"use strict";

/** external libraries */
import * as Translator from "bazinga-translator";

/** internal components */
import Config from "../config/Config";
import logger from "./Logger";

const translationFiles = new Map<string, any>([
    ["en", require("../../../../public/js/bazinga_jstranslation_js/translations/en.json")],
    ["ro", require("../../../../public/js/bazinga_jstranslation_js/translations/ro.json")]
]);

Config.getAllLocales().forEach((locale) => {
    if (translationFiles.has(locale)) {
        Translator.fromJSON(translationFiles.get(locale));
        return;
    }

    logger.error(`no translation file for "${locale}"`);
});

const translator = Translator;

export default translator;
