"use strict";

/** external libraries */
import Routing from "../../../../public/bundles/fosjsrouting/js/router.min";

/** internal components */
import Config from "../config/Config";

try {
    Routing.setRoutingData(require("../../../../public/js/fos_js_routes.json"));
} catch (error) {
    console.error(error);
}

export default class UrlGenerator {
    constructor() {
        this.locale = Config.getCurrentLocale();
    }

    generate = (route, parameters) => {
        parameters = Object.assign(
            parameters ? parameters : {},
            {
                "_locale": this.locale
            }
        );

        return Routing.generate(route, parameters);
    }
}
