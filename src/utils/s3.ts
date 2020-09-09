import AWS from 'aws-sdk';
import fs from 'fs';

type MaybeCredentials = AWS.SharedIniFileCredentials | undefined;

export async function getS3Client(credentials: MaybeCredentials) {
  return credentials ? new AWS.S3({ credentials }) : new AWS.S3();
}

export async function uploadVideoToS3({
  credentials,
  file,
  bucket,
  key,
}: {
  credentials: MaybeCredentials;
  file: string;
  bucket: string;
  key: string;
}) {
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
