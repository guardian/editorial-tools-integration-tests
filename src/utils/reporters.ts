import AWS from 'aws-sdk';
import { PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';
import mocha from 'mocha';
import fetch from 'node-fetch';
import env from '../../env.json';
import { Logger } from './logger';
import path from 'path';

const logDir = path.join(__dirname, '../logs');
const logFile = 'tests.json.log';
const routingKey = env.pagerduty.routingKey;

const logger = new Logger({ logDir, logFile });

export const generateMessage = (state: string, test: Mocha.Test) =>
  `${state} - ${test.titlePath().join(' - ')}`;

export function getVideoName(parent: Mocha.Suite): string {
  if (parent.root && parent.file) {
    const testFile = parent.file.split('/');
    return testFile[testFile.length - 1]; // yields <filename>.ts
  } else {
    return getVideoName(<Mocha.Suite>parent.parent);
  }
}

export async function putMetric({
  test,
  suite,
  result,
}: {
  test: mocha.Test;
  suite: string | undefined;
  result: string;
}) {
  const testContext = test.titlePath()[0];
  const metricValue = result === 'fail' ? 1 : 0;
  const credentials = env.isDev
    ? new AWS.SharedIniFileCredentials({
        profile: env.aws.profile,
      })
    : undefined;
  const cw = await getCloudWatchClient(credentials);

  // TODO: Make one big request at `runner.on('end')` with all results
  const metric: PutMetricDataInput = {
    MetricData: [
      {
        MetricName: 'Test Result',
        Dimensions: [
          { Name: 'uid', Value: `${suite}-${testContext}-${test.title}` },
          { Name: 'suite', Value: suite ?? 'suite-missing' },
          { Name: 'testName', Value: test.title },
          { Name: 'testContext', Value: testContext },
          { Name: 'testState', Value: result },
        ],
        Timestamp: new Date(),
        Value: metricValue,
      },
    ],
    Namespace: `editorial-tools-integration-tests`,
  };

  await cw.putMetricData(metric).promise();
}

export async function getCloudWatchClient(
  credentials: AWS.SharedIniFileCredentials | undefined
) {
  return credentials
    ? new AWS.CloudWatch({ credentials, region: 'eu-west-1' })
    : new AWS.CloudWatch({ region: 'eu-west-1' });
}

export async function callPagerduty(
  test: mocha.Test,
  action: string,
  details = {}
) {
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
