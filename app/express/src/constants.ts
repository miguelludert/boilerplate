import { kebabCase } from "change-case";
import { DynamoTableName } from "./utils/dynamo";
import { BucketName } from "./utils/s3";

// naming convention
const namingConvention = (name: string) =>
  `${process.env.APP_NAME}-${process.env.STAGE}-${kebabCase(name)}`;

// env vars
export const getRootPath = () => process.env.API_ROOT_PATH ?? "/";
export const getAwsRegion = () => process.env.AWS_REGION;
export const getDynamoDbEndpoint = () =>
  process.env.DYNAMO_DB_ENDPOINT || undefined;
export const getS3Endpoint = () => process.env.S3_ENDPOINT || undefined;

// constants
export const getMediaTablePartitionKey = () => "mediaId";
export const getMediaBySourcePartitionKey = () => "sourceName#sourceId#usage";
export const getMediaBySourceIndexName = () => "bySource";

// by convention
export const getUsersTableName = () =>
  namingConvention(`users-table`) as DynamoTableName;
export const getMediaTableName = () =>
  namingConvention(`media-table`) as DynamoTableName;
export const getMediaBucketName = () =>
  namingConvention(`media-bucket`) as BucketName;

// secrets
export const getAwsAccessKeyId = () => process.env.AWS_ACCESS_ID || "";
export const getAwsSecretAccessKey = () => process.env.AWS_ACCESS_SECRET || "";
export const getCognitoUserPoolId = () =>
  process.env.COGNITO_USER_POOL_ID || "";
export const getCognitoClientId = () => process.env.COGNITO_CLIENT_ID || "";
export const getContactFormRecipient = () =>
  process.env.CONTACT_FORM_RECIPIENT || "";
export const getContactFormSource = () => process.env.CONTACT_FORM_SOURCE || "";
export const getMediaSizeMBLimit = () => process.env.MEDIA_SIZE_MB_LIMIT || "";

// artwork
export const getArtworkTableName = () =>
  (process.env.ARTWORK_TABLE_NAME || "") as DynamoTableName;
