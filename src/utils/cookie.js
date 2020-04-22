const AWS = require("aws-sdk");
const iniparser = require("iniparser");
const { base64ToPEM } = require("@guardian/pan-domain-node/dist/src/utils");
const { createCookie } = require("@guardian/pan-domain-node/dist/src/panda");
const env = require("../../env.json");

const user = { ...env.user, expires: Date.now() + 1800000 };

async function getCookie(domain, stage) {
  let creds, s3;

  if (stage !== "prod" || stage !== "code" || stage !== "test") {
    creds = new AWS.SharedIniFileCredentials({
      profile: "media-service"
    });
    s3 = new AWS.S3({ credentials: creds });
  } else {
    //  Authenticate via EC2 instance permissions, rather than shared credentials
    s3 = new AWS.S3();
  }

  const settings = await s3
    .getObject({
      Bucket: env.s3.bucket,
      Key: `${domain}.settings`
    })
    .promise();

  const { privateKey } = iniparser.parseString(settings.Body.toString());

  if (privateKey) {
    const pemEncodedPrivateKey = base64ToPEM(privateKey, "RSA PRIVATE");
    return createCookie(user, pemEncodedPrivateKey);
  } else {
    throw new Error("Missing privateKey setting from config");
  }
}

function getDomain(stage) {
  switch (stage) {
    case "prod":
      return "gutools.co.uk";
    case undefined:
      return "local.dev-gutools.co.uk";
    default:
      return `${stage}.dev-gutools.co.uk`;
  }
}

(async function f() {
  const stage = process.env.STAGE ? process.env.STAGE.toLowerCase() : undefined;
  const domain = getDomain(stage);
  const cookie = await getCookie(domain, stage);
  console.log(JSON.stringify({ cookie, domain }));
})();
