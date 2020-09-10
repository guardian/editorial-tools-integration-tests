import mocha from 'mocha';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

import { Logger } from '../src/utils/logger';
import env from '../env.json';
const logDir = path.join(__dirname, '../logs');
const logFile = 'tests.json.log';
const timestamp = new Date().toISOString().substr(0, 16); // Yields `YYYY-DD-MMTHH-MM`

const routingKey = env.pagerduty.routingKey;
const logger = new Logger({ logDir, logFile });

module.exports = Pagerduty;

function generateMessage(state: string, test: Mocha.Test) {
  return `${state} - ${test.titlePath().join(' - ')}`;
}

function getRootSuite(parent: Mocha.Suite): Mocha.Suite {
  return parent.root ? parent : getRootSuite(<Mocha.Suite>parent.parent);
}

function getAppName(parent: Mocha.Suite): string {
  const rootSuite = getRootSuite(parent);
  const testFile = rootSuite.file.split('/');
  return testFile[testFile.length - 2]; // yields folder (suite) containing test file
}

function getVideoName(parent: Mocha.Suite): string {
  const rootSuite = getRootSuite(parent);
  const testFile = rootSuite.file.split('/');
  return testFile[testFile.length - 1]; // yields <filename>.ts
}

// `scripts/run.sh` is responsible for cleaning up the failures file
// If one exists on start, it's because a
// previous test suite in the same app has run before this
function getFailuresFile(failuresFile: string, failures: number) {
  if (fs.existsSync(failuresFile)) {
    failures = Number(fs.readFileSync(failuresFile));
  } else {
    fs.writeFileSync(failuresFile, '0');
  }
  return failures;
}

const getUID = (suite: Mocha.Suite, timestamp: string) =>
  `${getAppName(suite)}-${timestamp}`;

function Pagerduty(this: any, runner: Mocha.Runner) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;

  const app = getAppName(this.runner.suite);
  const uid = getUID(this.runner.suite, timestamp);
  const failuresFile = path.join(__dirname, `../${app}.failures.txt`);
  const runIDFile = path.join(__dirname, `../${app}.id.txt`);
  getFailuresFile(failuresFile, failures);
  fs.writeFileSync(runIDFile, uid); // Create run ID file that can be used by `uploadVideo.ts`

  try {
    runner.on('start', async function () {
      const message = `Started - ${app} with uid ${uid}`;
      console.log(message);
      logger.log({ message, uid });
    });

    runner.on('pending', async function (test) {
      const message = generateMessage('Pending', test);

      passes++;
      console.log('Pending:', test.fullTitle());
      logger.log({
        testSuite: app,
        uid,
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'pending',
      });
      await callPagerduty(test, 'resolve');
    });

    runner.on('pass', async function (test) {
      const message = generateMessage('Pass', test);
      passes++;
      console.log('Pass:', test.fullTitle());
      logger.log({
        testSuite: app,
        uid,
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'pass',
      });
      await callPagerduty(test, 'resolve');
    });

    runner.on('fail', async function (test, err) {
      const message = generateMessage('Failure', test);
      const video = getVideoName(<Mocha.Suite>test.parent);
      const now = new Date();
      const region = 'eu-west-1';
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      failures++;
      console.error('Failure:', test.fullTitle(), err.message, '\n');
      logger.error({
        uid,
        testSuite: app,
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'failure',
        error: err.message,
      });

      await callPagerduty(test, 'trigger', {
        error: err.message,
        videosFolder: `https://s3.console.aws.amazon.com/s3/buckets/${env.videoBucket}/videos/${year}/${month}/${date}/?region=${region}&tab=overview`,
        videosAccount: env.aws.profile,
        video: `https://s3.console.aws.amazon.com/s3/object/${env.videoBucket}/videos/${year}/${month}/${date}/${uid}-${app}-${video}.mp4`,
        uid,
      });
    });

    runner.on('end', async function () {
      console.log('end: %d/%d', passes, passes + failures);
      fs.writeFileSync(failuresFile, failures.toString());
      logger.log({
        message: `Ended - ${app} with uid ${uid}`,
        uid,
      });
    });
  } catch (e) {
    logger.error({
      message: `Error - ${app} [${uid}]: ${e.message}`,
      stackTrace: e.stack,
      uid,
    });
  }
}

async function callPagerduty(test: mocha.Test, action: string, details = {}) {
  const url = 'https://events.pagerduty.com/v2/enqueue';

  const data = {
    routing_key: routingKey,
    event_action: action,
    dedup_key: test.title,
    payload: {
      summary: `${test.titlePath()[0]} - ${test.title}`,
      source: 'https://github.com/guardian/editorial-tools-integration-tests',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      component: 'Editorial Tools Integration Tests',
      links: 'https://gu.com',
      custom_details: details,
    },
  };

  const params = {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, params);
  const json = await response.json();
  if (!response.ok) {
    console.error('PagerdutyReportError:', JSON.stringify(json));
    logger.error({
      message: `PagerdutyReportError: ${json.message}`,
      error: json.errors,
      data,
      uid: getUID,
    });
  }
}

mocha.utils.inherits(Pagerduty, mocha.reporters.Spec);
