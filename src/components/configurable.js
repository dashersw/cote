'use strict';

module.exports = (Base) => class Configurable extends Base {
    static get environment() {
        return this.constructor._environment || '';
    }

    static setEnvironment(environment) {
        if (!environment) return;

        this.constructor._environment = environment + ':';
    }


    static get useHostNames() {
        return this.constructor._useHostNames || false;
    }


    static setUseHostNames(useHostNames) {
        this.constructor._useHostNames = useHostNames;
    };
};
