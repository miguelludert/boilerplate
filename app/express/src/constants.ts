import { DynamoTableName } from './utils/dynamo';
import { BucketName } from './utils/s3';

// env vars
export const getRootPath = () => process.env.API_ROOT_PATH ?? '/';
export const getAwsRegion = () => process.env.AWS_REGION;
export const getDynamoDbEndpoint = () =>
  process.env.DYNAMO_DB_ENDPOINT || undefined;
export const getS3Endpoint = () => process.env.S3_ENDPOINT || undefined;

// constants
export const getMediaTablePartitionKey = () => 'mediaId';
export const getMediaBySourcePartitionKey = () => 'sourceName#sourceId#usage';
export const getMediaBySourceIndexName = () => 'bySource';

// secrets
export const getUsersTableName = () =>
  (process.env.USERS_TABLE_NAME || '') as DynamoTableName;
export const getMediaTableName = () =>
  (process.env.MEDIA_TABLE_NAME || '') as DynamoTableName;
export const getMediaBucketName = () =>
  (process.env.MEDIA_BUCKET_NAME || '') as BucketName;
export const getAwsAccessKeyId = () => process.env.AWS_ACCESS_ID || '';
export const getAwsSecretAccessKey = () => process.env.AWS_ACCESS_SECRET || '';
export const getCognitoUserPoolId = () =>
  process.env.COGNITO_USER_POOL_ID || '';
export const getCognitoClientId = () => process.env.COGNITO_CLIENT_ID || '';
export const getContactFormRecipient = () =>
  process.env.CONTACT_FORM_RECIPIENT || '';
export const getContactFormSource = () => process.env.CONTACT_FORM_SOURCE || '';
export const getMediaSizeMBLimit = () => process.env.MEDIA_SIZE_MB_LIMIT || '';
