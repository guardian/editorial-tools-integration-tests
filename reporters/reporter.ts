import mocha from 'mocha';
import fs from 'fs';
import path from 'path';

import { Logger } from '../src/utils/logger';
import {
  generateMessage,
  putMetric,
  getVideoName,
  getAppName,
  getUID,
  getFailuresFile,
} from '../src/utils/reporters';

const logDir = path.join(__dirname, '../logs');
const tmpDir = path.join(__dirname, '../tmp');
const logFile = 'tests.json.log';
const timestamp = new Date().toISOString().substr(0, 16); // Yields `YYYY-DD-MMTHH-MM`

// Yields `YYYY-DD-MMTHH-MM`
const start = new Date();
const logger = new Logger({ logDir, logFile });

module.exports = Reporter;

function Reporter(this: any, runner: Mocha.Runner) {
  // @ts-ignore
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;
  const suite = getAppName(this.runner.suite);
  const uid = getUID(this.runner.suite, timestamp);

  try {
    logger.setSuite(suite);
    logger.setUid(uid);

    const failuresFile = `${tmpDir}/${suite}.failures.txt`;
    const runIDFile = `${tmpDir}/${suite}.id.txt`;
    getFailuresFile({ failuresFile, failures, tmpDir });
    runner.on('start', async function () {
      // `scripts/run.sh` is responsible for cleaning up the failures file
      // If one exists on start, it's because a
      // previous test suite in the same app has run before this
      if (fs.existsSync(failuresFile)) {
        failures = Number(fs.readFileSync(failuresFile, { encoding: 'utf8' }));
      } else {
        fs.writeFileSync(failuresFile, '0');
      }

      // Create run ID file that can be used by `uploadVideo.ts`
      fs.writeFileSync(runIDFile, uid);
      logger.log({ message: `Started - ${suite} with uid ${uid}` });
    });

    runner.on('pending', async function (test) {
      const message = generateMessage('Pending', test);
      passes++;
      console.log('Pending:', test.fullTitle());
      logger.log({
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'pending',
      });
      await putMetric({ suite, test, result: 'pending' });
    });

    runner.on('pass', async function (test) {
      const message = generateMessage('Pass', test);
      passes++;
      console.log('Pass:', test.fullTitle());
      logger.log({
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'pass',
      });
      await putMetric({ suite, test, result: 'pass' });
    });

    runner.on('fail', async function (test, err) {
      const message = generateMessage('Failure', test);
      const video = getVideoName(<Mocha.Suite>test.parent); // TODO: Think of a way to surface this information in CW so that we can correlate alarms, logs and metrics
      failures++;
      console.error('Failure:', test.fullTitle(), err.message, '\n');
      logger.error({
        video,
        message,
        testTitle: test.title,
        testContext: test.titlePath()[0],
        testState: 'failure',
        error: err.message,
      });

      await putMetric({ suite, test, result: 'fail' });
    });

    runner.on('end', async function () {
      const end = new Date();
      const diffInSeconds = (
        Math.abs(end.getTime() - start.getTime()) / 1000
      ).toFixed(2);
      console.log('end: %d/%d', passes, passes + failures);
      fs.writeFileSync(failuresFile, failures.toString());
      logger.log({
        message: `Ended - ${suite} with uid ${uid} (took ${diffInSeconds} seconds)`,
        testRuntime: diffInSeconds,
      });
    });
  } catch (e) {
    logger.error({
      message: `Error - ${suite} [${uid}]: ${e.message}`,
      stackTrace: e.stack,
    });
  }
}

// @ts-ignore
mocha.utils.inherits(Reporter, mocha.reporters.Spec);
