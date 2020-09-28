import AWS from 'aws-sdk';
import { PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';
import mocha from 'mocha';
import env from '../../env.json';
const stage = process.env.STAGE;

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
  suite,
  result,
}: {
  test: mocha.Test;
  suite: string | undefined;
  result: string;
}) {
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

export async function getCloudWatchClient(
  credentials: AWS.SharedIniFileCredentials | undefined
) {
  return credentials
    ? new AWS.CloudWatch({ credentials, region: 'eu-west-1' })
    : new AWS.CloudWatch({ region: 'eu-west-1' });
}
