const AWS = require('aws-sdk');

async function getS3Client() {
  const chain = new AWS.CredentialProviderChain();
  const sharedIniCreds = new AWS.SharedIniFileCredentials({
    profile: 'media-service',
  });
  chain.providers.push(sharedIniCreds, new AWS.EC2MetadataCredentials());

  // await chain.resolvePromise();

  // TODO: Revert to asserting over config.isDev if we can't work this out
  return new AWS.S3({ credentialProvider: chain });
}

module.exports = { getS3Client };
