const mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { Logger } = require('../src/utils/logger');
const env = require('../env.json');

const logDir = path.join(__dirname, '../logs');
const logFile = 'tests.json.log';
const failuresFile = path.join(__dirname, '../failures.txt');

const routingKey = env.pagerduty.routingKey;
const logger = new Logger({ logDir, logFile });

module.exports = Pagerduty;

function Pagerduty(runner) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;

  runner.on('start', async function () {
    fs.writeFileSync(failuresFile, '0');
  });

  runner.on('pending', async function (test) {
    passes++;
    console.log('Pending:', test.fullTitle());
    logger.log({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'pending',
    });
    await callPagerduty(test, 'resolve');
  });

  runner.on('pass', async function (test) {
    passes++;
    console.log('Pass:', test.fullTitle());
    logger.log({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'pass',
    });
    await callPagerduty(test, 'resolve');
  });

  runner.on('fail', async function (test, err) {
    const now = new Date();
    const region = 'eu-west-1';
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    failures++;
    console.error('Failure:', test.fullTitle(), err.message, '\n');
    logger.error({
      testTitle: test.title,
      testContext: test.titlePath()[0],
      testState: 'failure',
      error: err.message,
    });
    await callPagerduty(test, 'trigger', {
      error: err.message,
      videosFolder: `https://s3.console.aws.amazon.com/s3/buckets/${env.videoBucket}/videos/${year}/${month}/${date}/?region=${region}&tab=overview`,
    });
  });

  runner.on('end', async function () {
    console.log('end: %d/%d', passes, passes + failures);
    fs.writeFileSync(failuresFile, failures);
  });
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
    });
  }
}

mocha.utils.inherits(Pagerduty, mocha.reporters.Spec);
