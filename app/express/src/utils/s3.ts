import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { Response } from 'express';
import {
  getAwsAccessKeyId,
  getAwsRegion,
  getAwsSecretAccessKey,
  getS3Endpoint,
} from '../constants';
import { EndsWith } from '../types';

export type BucketName = EndsWith<'-bucket'>;

const getS3Client = () => {
  const credentials =
    getAwsAccessKeyId() && getAwsSecretAccessKey()
      ? {
          accessKeyId: getAwsAccessKeyId(),
          secretAccessKey: getAwsSecretAccessKey(),
        }
      : undefined;
  const s3Client = new S3Client({
    endpoint: getS3Endpoint(),
    region: getAwsRegion(),
    credentials,
    forcePathStyle: true,
  });
  return s3Client;
};

export const writeObjectToS3 = async (
  bucket: string,
  key: string,
  data: Buffer,
  contentType: string = 'application/json'
): Promise<void> => {
  try {
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    });

    await s3Client.send(command);
    console.log(`Object written to S3: s3://${bucket}/${key}`);
  } catch (error) {
    console.error('Error writing object to S3:', error);
    throw error;
  }
};

export const createUploadUrl = async (
  bucket: BucketName,
  key: string,
  metadata?: Record<string, any>
): Promise<string> => {
  const s3Client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Metadata: metadata,
    //Expires: dateFns.addSeconds(new Date(), 30),
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  return url;
};

export const sendObjectStreamToResponse = async (
  bucketName: BucketName,
  key: string,
  res: Response
) => {
  throw 'no implemented properly';

  try {
    // Fetch the object from S3
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const s3Response = await getS3Client().send(command);

    if (!s3Response.Body) {
      return res.status(404).send('File not found');
    }

    // Set appropriate headers for the file stream
    res.setHeader(
      'Content-Type',
      s3Response.ContentType || 'application/octet-stream'
    );
    res.setHeader('Content-Length', s3Response.ContentLength || '0');

    // // Stream the file to the client
    // const byteArray = s3Response.Body.transformToByteArray();
    // res.send(Buffer.from(s3Response.Body));
  } catch (error) {
    console.error('Error streaming file from S3:', error);
    res.status(500).send('Failed to fetch the file');
  }
};

/**
 * Deletes a single object from an S3 bucket.
 *
 * @param bucketName - The name of the S3 bucket
 * @param key - The key (path/filename) of the object to delete
 */
export async function deleteOneObject(
  bucketName: BucketName,
  key: string
): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await getS3Client().send(command);
    console.log(
      `Object "${key}" deleted successfully from bucket "${bucketName}".`
    );
  } catch (error) {
    console.error('Error deleting object:', error);
    throw new Error('Failed to delete object');
  }
}

/**
 * Deletes a batch of objects from an S3 bucket.
 *
 * @param bucketName - The name of the S3 bucket
 * @param keys - An array of keys (paths/filenames) of the objects to delete
 */
export async function deleteBatchObjects(
  bucketName: BucketName,
  keys: string[]
): Promise<void> {
  if (keys.length === 0) {
    console.log('No objects to delete.');
    return;
  }

  const deleteObjects = keys.map((key) => ({ Key: key }));
  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: deleteObjects,
      },
    });

    const response = await getS3Client().send(command);

    // Log successfully deleted objects
    if (response.Deleted) {
      response.Deleted.forEach((item) => {
        console.log(`Deleted: ${item.Key}`);
      });
    }

    // Log any errors
    if (response.Errors && response.Errors.length > 0) {
      response.Errors.forEach((error) => {
        console.error(`Error deleting ${error.Key}: ${error.Message}`);
      });
    }
  } catch (error) {
    console.error('Error deleting objects:', error);
    throw new Error('Failed to delete batch objects');
  }
}

export const getObjectAsBuffer = async (bucket: string, key: string) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const s3Response = await getS3Client().send(command);

    if (!s3Response.Body) {
      console.warn(
        'No body returned from S3. The object might be empty or does not exist.'
      );
      return null;
    }

    if (s3Response.ContentLength === 0) {
      console.warn('The object exists but is empty (0 bytes).');
      return null;
    }

    // Convert Body (ReadableStream) to Buffer
    const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    };

    const contentType = s3Response.ContentType || 'application/octet-stream';
    const contentLength = s3Response.ContentLength || '0';
    const buffer = await streamToBuffer(s3Response.Body as Readable);

    return {
      buffer,
      contentType,
      contentLength,
    };
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      console.warn(`The specified object does not exist: ${key}`);
      return null;
    }
    console.error('Error fetching object from S3:', error);
    throw error;
  }
};

/**
 * Lists all objects in an S3 bucket that start with a specific prefix.
 * @param bucket - The S3 bucket name.
 * @param prefix - The prefix to match objects for deletion.
 */
export const listObjectsWithPrefix = async (
  bucket: string,
  prefix: string
): Promise<string[]> => {
  try {
    let continuationToken: string | undefined = undefined;
    const objectsToDelete: { Key: string }[] = [];

    // Fetch objects with the specified prefix
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await getS3Client().send(listCommand);

      if (listResponse.Contents) {
        for (const item of listResponse.Contents) {
          if (item.Key) {
            objectsToDelete.push({ Key: item.Key });
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    if (objectsToDelete.length === 0) {
      console.log(`No objects found with prefix: ${prefix}`);
      return [];
    }

    return objectsToDelete.map((m) => m.Key);
  } catch (error) {
    console.error('Error deleting objects:', error);
    throw error;
  }
};
