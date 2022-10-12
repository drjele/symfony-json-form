"use strict";

/** external libraries */
import * as TranslatorBase from "bazinga-translator";

/** internal components */
import Config from "../config/Config";

Config.getAllLocales().forEach(
    (locale) => {
        try {
            TranslatorBase.fromJSON(
                require("../../../../public/js/bazinga_jstranslation_js/translations/" + locale + ".json")
            );
        } catch (error) {
            console.error(error);
        }
    }
);

export default class Translator {
    constructor() {
        this.locale = Config.getCurrentLocale();
    }

    translate = (id, parameters, domain, locale) => {
        if (locale === undefined) {
            locale = this.locale;
        }

        return TranslatorBase.trans(id, parameters, domain, locale);
    }
}
