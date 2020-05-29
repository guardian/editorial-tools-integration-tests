const AWS = require('aws-sdk');

const iniparser = require('iniparser');
const { base64ToPEM } = require('@guardian/pan-domain-node/dist/src/utils');
const { createCookie } = require('@guardian/pan-domain-node/dist/src/panda');
const env = require('../../env.json');
const { baseUrl } = require('../../cypress.env.json');
const { getS3Client } = require('./s3');

const user = { ...env.user, expires: Date.now() + 1800000 };

async function getCookie(domain) {
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
      console.error(err);
      process.exit(1);
    });

  const { privateKey } = iniparser.parseString(settings.Body.toString());

  if (privateKey) {
    const pemEncodedPrivateKey = base64ToPEM(privateKey, 'RSA PRIVATE');
    return createCookie(user, pemEncodedPrivateKey);
  } else {
    throw new Error('Missing privateKey setting from config');
  }
}

function getDomain(stage) {
  if (stage === 'gutools') {
    return 'gutools.co.uk';
  } else {
    return `${stage}.dev-gutools.co.uk`;
  }
}

(async function f() {
  // infer env from cypress.env.json URL
  const stage = baseUrl.split('/')[2].split('.')[1];
  const domain = getDomain(stage);
  const cookie = await getCookie(domain).catch((err) => {
    console.error(err);
    process.exit(1);
  });
  console.log(JSON.stringify({ cookie, domain }));
})();
