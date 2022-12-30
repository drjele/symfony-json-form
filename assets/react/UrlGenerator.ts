"use strict";

/** external libraries */
import router from "../../../../public/bundles/fosjsrouting/js/router";
import routes from "../../../../public/js/fos_js_routes.json";

/** internal components */
import {MapType} from "../type/Map";
import React from "react";
import LanguageContext from "../context/LanguageContext";

router.setRoutingData(routes);

class UrlGenerator {
    private readonly locale: string;

    constructor(locale: string) {
        this.locale = locale;
    }

    generate = (route: string, parameters?: MapType): string => {
        parameters = {
            _locale: this.locale,
            ...parameters
        }

        return router.generate(route, parameters, true);
    }
}

const useUrlGenerator = () => {
    const languageContext = React.useContext(LanguageContext);

    const locale = languageContext.getLocale();

    return new UrlGenerator(locale);
}

export default useUrlGenerator;
