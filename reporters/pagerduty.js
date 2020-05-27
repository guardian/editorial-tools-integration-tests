const { Logger } = require('../src/utils/logger');

const mocha = require('mocha');
const fetch = require('node-fetch');
const config = require('../cypress.env.json');
const env = require('../env.json');

const logDir = `${__dirname}/../logs`;
const logFile = 'tests.json.log';

const routingKey = env.pagerduty.routingKey;
const logger = new Logger({ logDir, logFile });

module.exports = Pagerduty;

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

  runner.on('end', function () {
    console.log('end: %d/%d', passes, passes + failures);
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
