const path = require('path');
const env = require('../../env.json');

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

    static get pandaUser() {
        return env.user;
    }

    static get pandaSettingsBucket() {
        return env.s3.bucket;
    }

    static get awsProfile() {
        return env.aws.profile;
    }

    static get toolsDomain() {
        return this.isProd 
            ? 'gutools.co.uk' 
            : `${this.stage.toLowerCase()}.dev-gutools.co.uk`;
    }

    static get videoBucket() {
        return env.videoBucket;
    }

    static get pagerdutyRoutingKey() {
        return env.pagerduty.routingKey;
    }
}

module.exports = Config;