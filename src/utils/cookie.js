const AWS = require('aws-sdk');

const path = require('path');
const fs = require('fs');
const iniparser = require('iniparser');
const { base64ToPEM } = require('@guardian/pan-domain-node/dist/src/utils');
const { createCookie } = require('@guardian/pan-domain-node/dist/src/panda');
const env = require('../../env.json');
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
      console.log(`Unable to read pandomain settings from ${env.s3.bucket}/${domain}.settings`)
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
  if (stage === 'prod') {
    return "gutools.co.uk";
  } else {
    return `${stage}.dev-gutools.co.uk`;
  }
}

(async function f() {
  const stage=process.env['STAGE'];
  const domain = getDomain(stage);
  const cookie = await getCookie(domain).catch((err) => {
    console.log(`Received an error - please check you can access ${domain}`);
    console.error(err);
    process.exit(1);
  });
  fs.writeFileSync(
    path.join(__dirname, `../../cookie.json`),
    JSON.stringify({ cookie, domain })
  );
})();
