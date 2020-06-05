const path = require('path');

class Config {
    static get stack() {
        return process.env.STACK;
    }

    static get stage() {
        return (process.env.STAGE || 'DEV').toUpperCase();
    }

    static get app() {
        return process.env.APP;
    }

    static get isDev() {
        return this.stage === 'DEV';
    }

    static get isProd() {
        return this.stage === 'PROD';
    }

    static get suite() {
        return process.env.SUITE;
    }

    static get failureFilepath() {
        // failure files land in the root
        return path.join(__dirname, '..', `${this.suite}.failures.txt`);
    }
}

module.exports = Config;