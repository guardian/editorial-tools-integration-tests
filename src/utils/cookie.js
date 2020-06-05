const AWS = require('aws-sdk');

const path = require('path');
const fs = require('fs');
const iniparser = require('iniparser');
const { base64ToPEM } = require('@guardian/pan-domain-node/dist/src/utils');
const { createCookie } = require('@guardian/pan-domain-node/dist/src/panda');
const { getS3Client } = require('./s3');
const Config = require('./config');

const user = { ...Config.pandaUser, expires: Date.now() + 1800000 };

async function getCookie(domain) {
  const credentials = Config.isDev
    ? new AWS.SharedIniFileCredentials({
        profile: Config.awsProfile,
      })
    : undefined;

  const s3 = await getS3Client(credentials);

  const settings = await s3
    .getObject({
      Bucket: Config.pandaSettingsBucket,
      Key: `${domain}.settings`,
    })
    .promise()
    .catch((err) => {
      console.log(
        `Unable to read pandomain settings from ${Config.pandaSettingsBucket}/${domain}.settings`
      );
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

(async function f() {
  const cookie = await getCookie(Config.toolsDomain).catch((err) => {
    console.log(`Received an error - please check you can access ${Config.toolsDomain}`);
    console.error(err);
    process.exit(1);
  });
  fs.writeFileSync(
    path.join(__dirname, `../../cookie.json`),
    JSON.stringify({ cookie, domain: Config.toolsDomain })
  );
})();
