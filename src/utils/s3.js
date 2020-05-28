const AWS = require('aws-sdk');
const config = require('../../env.json');

async function getS3Client({ dev, profile, filename }) {
  if (config.isDev || dev) {
    const sharedIniCreds = new AWS.SharedIniFileCredentials({
      profile,
      ...(filename && { filename }),
    });

    return new AWS.S3({ credentials: sharedIniCreds });
  } else {
    return new AWS.S3();
  }
}

module.exports = { getS3Client };
