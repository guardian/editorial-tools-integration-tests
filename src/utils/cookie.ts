import AWS from 'aws-sdk';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const iniparser = require('iniparser');
import { base64ToPEM } from '@guardian/pan-domain-node/dist/src/utils';
import { createCookie } from '@guardian/pan-domain-node/dist/src/panda';
import env from '../../env.json';
import { getS3Client } from './s3';

const user = { ...env.user, expires: Date.now() + 1800000 };

async function getCookie(domain: string | undefined = undefined) {
  const credentials = env.isDev
    ? new AWS.SharedIniFileCredentials({
        profile: env.aws.profile,
      })
    : undefined;

  const s3 = await getS3Client(credentials);

  const settings = await s3
    .getObject({
      Bucket: env.s3.bucket,
      Key: `${domain}.settings`,
    })
    .promise()
    .catch((err) => {
      console.log(
        `Unable to read pandomain settings from ${env.s3.bucket}/${domain}.settings`
      );
      console.error(err);
      process.exit(1);
    });

  const { privateKey } = iniparser.parseString(settings?.Body?.toString());

  if (privateKey) {
    const pemEncodedPrivateKey = base64ToPEM(privateKey, 'RSA PRIVATE');
    return createCookie(user, pemEncodedPrivateKey);
  } else {
    throw new Error('Missing privateKey setting from config');
  }
}

function getDomain(stage: string | undefined) {
  const lowercasedStage = stage?.toLowerCase();
  if (lowercasedStage === 'prod') {
    return 'gutools.co.uk';
  } else {
    return `${lowercasedStage}.dev-gutools.co.uk`;
  }
}

function checkVars() {
  if (!process.env.STAGE) {
    throw new Error('Please pass STAGE environmental variable to this script');
  }
}

async function cookie(stageArg = undefined) {
  try {
    checkVars();
    const stage = stageArg || process.env['STAGE'];
    const domain = getDomain(stage);
    const cookie = await getCookie(domain).catch((err) => {
      console.log(`Received an error - please check you can access ${domain}`);
      console.error(err);
      process.exit(1);
    });

    return { cookie, domain };
  } catch (err) {
    console.error(err);
  }
}

module.exports = { cookie };

if (require.main === module) {
  (async () => {
    const cookie = await getCookie();
    console.log(cookie);
  })();
}
