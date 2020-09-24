import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import { Logger } from '../src/utils/logger';
import { uploadVideoToS3 } from '../src/utils/s3';
import config from '../env.json';

const suite = process.env.SUITE;

const logFile = 'tests.json.log';
const logDir = path.join(__dirname, '../logs');
const tmpDir = path.join(__dirname, '../tmp');
const failuresFile = path.join(`${tmpDir}/${suite}.failures.txt`);
const idFile = path.join(`${tmpDir}/${suite}.id.txt`);
const videoDir = path.join(__dirname, `../cypress/videos/${suite}`);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const date = now.getDate();

(async function f() {
  const logger = new Logger({ logDir, logFile });
  let uid: string | null = null;

  try {
    uid = fs.readFileSync(idFile, { encoding: 'utf8' });
  } catch (e) {
    logger.error({
      error: e.message,
      message: `Failure to upload video ${videoDir}: Error reading UID file from ${idFile}: ${e.message}`,
      stackTrace: e.stack,
      uid,
    });
    return;
  }

  try {
    const failures = Number(
      fs.readFileSync(failuresFile, { encoding: 'utf8' })
    );

    if (failures > 0) {
      const credentials = config.isDev
        ? new AWS.SharedIniFileCredentials({
            profile: config.aws.profile,
          })
        : undefined;

      const videos = fs.readdirSync(videoDir);

      await Promise.all(
        videos.map(async (video) => {
          // Videos run every 5 minutes, so adding anything past the minute is unnecessary

          const key = `videos/${year}/${month}/${date}/${uid}-${suite}-${video}`;

          await uploadVideoToS3({
            credentials,
            file: `${videoDir}/${video}`,
            bucket: config.videoBucket,
            key,
          });

          logger.log({
            uid,
            message: `Video [${key}] uploaded to ${config.videoBucket}`,
            video: `https://s3.console.aws.amazon.com/s3/object/${config.videoBucket}/${key}.mp4`,
          });
        })
      );
    } else {
      logger.log({
        uid,
        message: `No failures for suite ${suite}, not uploading video`,
      });
    }
  } catch (e) {
    logger.error({
      uid,
      message: `Error when attempting to upload video {${uid}} from [${videoDir}]: ${e.message}`,
      stackTrace: e.stack,
      error: e.message,
    });
    console.error(e);
  }
})();
