const AWS = require('aws-sdk');
const iniparser = require('iniparser');
const {base64ToPEM} = require('@guardian/pan-domain-node/dist/src/utils');
const {createCookie} = require('@guardian/pan-domain-node/dist/src/panda');
const env = require('../../env.json');
const {baseUrl} = require('../../cypress.env.json');

const user = {...env.user, expires: Date.now() + 1800000};

async function getCookie(domain, environment) {
  let credentials; let s3;

  if (environment === 'dev') {
    credentials = new AWS.SharedIniFileCredentials({
      profile: 'media-service',
    });
    s3 = new AWS.S3({credentials});
  } else {
    //  Authenticate via EC2 instance permissions,
    // rather than shared credentials
    s3 = new AWS.S3();
  }

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

  const {privateKey} = iniparser.parseString(settings.Body.toString());

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
  const cookie = await getCookie(domain, process.env.ENV || 'dev');
  console.log(JSON.stringify({cookie, domain}));
})();
