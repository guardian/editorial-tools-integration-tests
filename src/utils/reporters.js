const AWS = require('aws-sdk');
const env = require('../../env.json');
const stage = process.env.STAGE;

const generateMessage = (state, test) =>
  `${state} - ${test.titlePath().join(' - ')}`;

function getVideoName(parent) {
  if (parent.root && parent.file) {
    const testFile = parent.file.split('/');
    return testFile[testFile.length - 1]; // yields <filename>.ts
  } else {
    return getVideoName(parent.parent);
  }
}

async function putMetric({ suite, result }) {
  const metricValue = result === 'fail' ? 1 : 0;
  const credentials = env.isDev
    ? new AWS.SharedIniFileCredentials({
        profile: env.aws.profile,
      })
    : undefined;
  const cw = await getCloudWatchClient(credentials);

  // TODO: Make one big request at `runner.on('end')` with all results
  const metric = {
    MetricData: [
      {
        MetricName: 'Test Result',
        Dimensions: [
          { Name: 'suite', Value: suite ?? 'suite-missing' },
          { Name: 'stage', Value: stage?.toUpperCase() || 'UNKNOWN' },
        ],
        Timestamp: new Date(),
        Value: metricValue,
      },
    ],
    Namespace: `editorial-tools-integration-tests`,
  };

  await cw.putMetricData(metric).promise();
}

async function getCloudWatchClient(credentials) {
  return credentials
    ? new AWS.CloudWatch({ credentials, region: 'eu-west-1' })
    : new AWS.CloudWatch({ region: 'eu-west-1' });
}

module.exports = {
  generateMessage,
  putMetric
}
