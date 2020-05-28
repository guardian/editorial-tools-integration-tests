const mocha = require('mocha');
const fs = require('fs');
const fetch = require('node-fetch');

const { Logger } = require('../src/utils/logger');
const { getS3Client } = require('../src/utils/s3');
const config = require('../cypress.env.json');
const env = require('../env.json');

const logDir = `${__dirname}/../logs`;
const logFile = 'tests.json.log';

const routingKey = env.pagerduty.routingKey;
const logger = new Logger({ logDir, logFile });

module.exports = Pagerduty;

// eslint-disable-next-line no-unused-vars
async function uploadVideoToS3() {
  const s3 = await getS3Client({
    dev: true,
    profile: 'media-service',
    filename: '/aws/credentials',
  });
  const videoData = fs.readFileSync('../cypress/videos/grid/grid_spec.js.mp4');
  await s3
    .putObject({
      Bucket: env.videoBucket,
      Key: `videos/integration-tests-${Date.now()}`,
      Body: videoData,
    })
    .promise()
    .catch((err) => console.error(err));
}

function Pagerduty(runner) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;

  runner.on('pending', async function (test) {
    passes++;
    console.log('Pending:', test.fullTitle());
    logger.log({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'pending',
    });
    await callPagerduty(test.title, 'resolve');
  });

  runner.on('pass', async function (test) {
    passes++;
    console.log('Pass:', test.fullTitle());
    logger.log({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'pass',
    });
    await callPagerduty(test.title, 'resolve');
  });

  runner.on('fail', async function (test, err) {
    failures++;
    console.error('Failure:', test.fullTitle(), err.message, '\n');
    logger.error({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'failure',
      error: err.message,
    });
    await callPagerduty(test.title, 'trigger', {
      error: err.message,
      errorTitle: err.title,
    });
  });

  runner.on('end', async function () {
    console.log('end: %d/%d', passes, passes + failures);
    if (failures > 0 && !env.isDev) {
      console.log(
        `Test suite had ${failures} failures and not in dev-mode, uploading video to S3`
      );
      // TODO: Find a way to do this once video is actually created
      // right now this is before the video is available
      // If this doesn't work, upload within run.sh
      // await uploadVideoToS3();
    } else {
      console.log(
        `Clean run or in dev-mode, not uploading video (clean run: ${process.env.CLEAN}, dev: ${env.isDev})`
      );
    }
  });
}

async function callPagerduty(incidentKey, action, details = {}) {
  const url = 'https://events.pagerduty.com/v2/enqueue';

  const data = {
    routing_key: routingKey,
    event_action: action,
    dedup_key: incidentKey,
    payload: {
      summary: incidentKey,
      source: config.baseUrl,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      component: 'gridmon',
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
  }
}

mocha.utils.inherits(Pagerduty, mocha.reporters.Spec);
