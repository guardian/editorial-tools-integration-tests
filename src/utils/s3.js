const AWS = require('aws-sdk');
const fs = require('fs');

async function getS3Client(credentials) {
  return credentials ? new AWS.S3({ credentials }) : new AWS.S3();
}

async function uploadVideoToS3({ credentials, file, bucket, key }) {
  const s3 = await getS3Client(credentials);
  const videoData = fs.readFileSync(file);
  await s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: videoData,
    })
    .promise()
    .catch((err) => console.error(err));
}

module.exports = { getS3Client, uploadVideoToS3 };
