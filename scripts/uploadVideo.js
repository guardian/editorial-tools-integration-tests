const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const { Logger } = require('../src/utils/logger');

const { uploadVideoToS3 } = require('../src/utils/s3');
const config = require('../env.json');

const Config = require('../src/utils/config');

const logFile = 'tests.json.log';
const logDir = path.join(__dirname, '../logs');

const videoLocation = path.join(
  __dirname,
  `../cypress/videos/${Config.suite}/spec.js.mp4`
);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const date = now.getDate();

const key = `videos/${year}/${month}/${date}/integration-tests-${new Date().toISOString()}.mp4`;

(async function f() {
  const logger = new Logger({ logDir, logFile });

  try {
    const failures = fs.readFileSync(Config.failureFilepath);

    if (failures > 0) {
      const credentials = config.isDev
        ? new AWS.SharedIniFileCredentials({
            profile: config.aws.profile,
          })
        : undefined;

      await uploadVideoToS3({
        credentials,
        file: videoLocation,
        bucket: config.videoBucket,
        key,
      });

      logger.log({
        message: `Video [${key}] uploaded to ${config.videoBucket}`,
      });
    } else {
      logger.log({
        message: `No failures for suite ${Config.suite}, not uploading video`,
      });
    }
  } catch (e) {
    logger.error({ message: e.message, stackTrace: e.stack });
    console.error(e);
  }
})();
