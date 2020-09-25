import mocha from 'mocha';
import fs from 'fs';
import path from 'path';

import { Logger } from '../src/utils/logger';
import env from '../env.json';
import {
  generateMessage,
  putMetric,
  getVideoName,
  callPagerduty,
} from '../src/utils/reporters';
const suite = process.env.SUITE;

if (!suite) {
  throw new Error(`No suite passed into ${process.argv[1]} as envar`);
}

const logDir = path.join(__dirname, '../logs');
const tmpDir = path.join(__dirname, '../tmp');
const logFile = 'tests.json.log';
const failuresFile = `${tmpDir}/${suite}.failures.txt`;
const runIDFile = `${tmpDir}/${suite}.id.txt`;
// Yields `YYYY-DD-MMTHH-MM`
const uid = new Date().toISOString().substr(0, 16);

const logger = new Logger({ logDir, logFile });

module.exports = Reporter;

function Reporter(runner: Mocha.Runner) {
  // @ts-ignore
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;

  try {
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
      logger.log({
        message: `Started - ${suite} with uid ${uid}`,
        uid,
      });
    });

    runner.on('pending', async function (test) {
      const message = generateMessage('Pending', test);
      passes++;
      console.log('Pending:', test.fullTitle());
      logger.log({
        uid,
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
        uid,
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
        uid,
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
      console.log('end: %d/%d', passes, passes + failures);
      fs.writeFileSync(failuresFile, failures.toString());
      logger.log({
        message: `Ended - ${suite} with uid ${uid}`,
        uid,
      });
    });
  } catch (e) {
    logger.error({
      message: `Error - ${suite} [${uid}]: ${e.message}`,
      stackTrace: e.stack,
      uid,
    });
  }
}

// @ts-ignore
mocha.utils.inherits(Reporter, mocha.reporters.Spec);
