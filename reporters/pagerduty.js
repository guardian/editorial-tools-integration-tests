const mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { Logger } = require('../src/utils/logger');
const env = require('../env.json');
const suite = process.env.SUITE;

const logDir = path.join(__dirname, '../logs');
const logFile = 'tests.json.log';
const failuresFile = path.join(__dirname, `../${suite}.failures.txt`);
const runIDFile = path.join(__dirname, `../${suite}.id.txt`);
// Yields `YYYY-DD-MMTHH-MM`
const uid = new Date().toISOString().substr(0, 16);

const routingKey = env.pagerduty.routingKey;
const logger = new Logger({ logDir, logFile });

module.exports = Pagerduty;

function generateMessage(state, test) {
  return `${state} - ${test.titlePath().join(' - ')}`;
}

function getVideoName(parent) {
  if (parent.root) {
    const testFile = parent.file.split('/');
    return testFile[testFile.length - 1]; // yields <filename>.ts
  } else {
    return getVideoName(parent.parent);
  }
}

function Pagerduty(runner) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;

  try {
    runner.on('start', async function () {
      // `scripts/run.sh` is responsible for cleaning up the failures file
      // If one exists on start, it's because a
      // previous test suite in the same app has run before this
      if (fs.existsSync(failuresFile)) {
        failures = fs.readFileSync(failuresFile);
      } else {
        fs.writeFileSync(failuresFile, '0');
      }

      // Create run ID file that can be used by `uploadVideo.js`
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
      await callPagerduty(test, 'resolve');
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
      await callPagerduty(test, 'resolve');
    });

    runner.on('fail', async function (test, err) {
      const message = generateMessage('Failure', test);
      const now = new Date();
      const region = 'eu-west-1';
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      failures++;
      console.error('Failure:', test.fullTitle(), err.message, '\n');
      logger.error({
        uid,
        testTitle: test.title,
        message,
        testContext: test.titlePath()[0],
        testState: 'failure',
        error: err.message,
      });

      const video = getVideoName(test.parent);
      await callPagerduty(test, 'trigger', {
        error: err.message,
        videosFolder: `https://s3.console.aws.amazon.com/s3/buckets/${env.videoBucket}/videos/${year}/${month}/${date}/?region=${region}&tab=overview`,
        videosAccount: env.aws.profile,
        video: `https://s3.console.aws.amazon.com/s3/object/${env.videoBucket}/videos/${year}/${month}/${date}/${uid}-${suite}-${video}.mp4`,
        uid,
      });
    });

    runner.on('end', async function () {
      console.log('end: %d/%d', passes, passes + failures);
      fs.writeFileSync(failuresFile, failures);
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

async function callPagerduty(test, action, details = {}) {
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
      uid,
    });
  }
}

mocha.utils.inherits(Pagerduty, mocha.reporters.Spec);
