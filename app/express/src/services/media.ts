import {
  getMediaBucketName,
  getMediaBySourceIndexName,
  getMediaBySourcePartitionKey,
  getMediaTableName,
  getMediaTablePartitionKey,
} from '../constants';
import {
  deleteBatchItems,
  deleteItem,
  putItem,
  queryByKey,
} from '../utils/dynamo';
import {
  createUploadUrl,
  deleteBatchObjects,
  deleteOneObject,
  getObjectAsBuffer,
  sendObjectStreamToResponse,
  writeObjectToS3,
} from '../utils/s3';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createHashFromObject } from '../utils/create-hash-from-object';

export interface MediaSourcePartitionKey {
  sourceTableName: string;
  sourceId: string;
  usage?: string;
}

export type MediaObject = MediaSourcePartitionKey & {
  hash: string;
  fileName: string;
  dateCreated: string;
  status: 'ok' | 'pending' | 'error';
  mediaId: string;
  userId: '';
};

export type SupportedImageFormatTypes = 'jpg' | 'png';

export interface ImageResizeProps {
  format?: SupportedImageFormatTypes;
  quality?: number;
  sizing?: 'scaleToFit' | 'width' | 'height' | 'crop' | 'fill';
  center?: { x: number; y: number } | 'faces' | 'center';
  height?: number;
  width?: number;
}

export const getAllMediaBySource = async ({
  sourceTableName,
  sourceId,
  usage,
}: MediaSourcePartitionKey) => {
  const items = await queryByKey<MediaObject>(
    getMediaTableName(),
    {
      name: getMediaBySourcePartitionKey(),
      value: (usage
        ? [sourceTableName, sourceId, usage]
        : [sourceTableName, sourceId]
      ).join('#'),
      operator: usage ? 'equals' : 'begins_with',
    },
    undefined,
    getMediaBySourceIndexName()
  );
  return items;
};

export const addMediaToSource = async (
  userId: string,
  { sourceTableName, sourceId, usage }: MediaSourcePartitionKey,
  fileName: string,
  fileType: string
) => {
  const mediaId = uuid();
  await putItem(getMediaTableName(), {
    [getMediaBySourcePartitionKey()]: [sourceTableName, sourceId, usage].join(
      '#'
    ),
    mediaId,
    sourceTableName,
    sourceId,
    usage,
    status: 'pending',
    dateCreated: new Date().toISOString(),
    userId,
  });
  const uploadUrl = await createUploadUrl(getMediaBucketName(), mediaId, {
    mediaId,
    sourceTableName,
    sourceId,
    usage,
    dateCreated: new Date().toISOString(),
    userId,
  });
  return {
    mediaId,
    uploadUrl,
  };
};

export const deleteAllMediaForSource = async ({
  sourceTableName,
  sourceId,
  usage,
}: MediaSourcePartitionKey) => {
  const items = await getAllMediaBySource({
    sourceTableName,
    sourceId,
    usage,
  });
  const deleteItemsPromise = deleteBatchItems(
    getMediaTableName(),
    items.map((m) => ({
      mediaId: m.mediaId,
    }))
  );
  const deleteObjectsPromise = deleteBatchObjects(
    getMediaBucketName(),
    items.map((m) => m.mediaId)
  );
  await deleteItemsPromise;
  await deleteObjectsPromise;
};

export const deleteMediaById = async (mediaId: string) => {
  const deleteItemPromise = deleteItem(getMediaTableName(), {
    name: getMediaTablePartitionKey(),
    value: mediaId,
  });
  const deleteObjectPromise = deleteOneObject(getMediaBucketName(), mediaId);
  await deleteItemPromise;
  await deleteObjectPromise;
};

export const sendMediaToResponse = async (mediaId: string, res: Response) => {
  await sendObjectStreamToResponse(getMediaBucketName(), mediaId, res);
};

export const resizeImage = async (
  mediaId: string,
  resizeProps: ImageResizeProps
) => {
  const { format, quality, sizing, center, height, width } = resizeProps;
  const resizeHash = createHashFromObject(resizeProps);
  const resizeKey = `${mediaId}.${resizeHash}`;
  const resizeBufferResponse = await getObjectAsBuffer(
    getMediaBucketName(),
    resizeKey
  );
  if (resizeBufferResponse) {
    return resizeBufferResponse;
  }

  const originalBuffer = await getObjectAsBuffer(getMediaBucketName(), mediaId);
  if (!originalBuffer) {
    throw new Error(`Media ${mediaId} either does not exist or is corrupted.`);
  }

  let sharpInstance = sharp(originalBuffer.buffer);

  // Handle resizing based on `sizing`
  switch (sizing) {
    case 'scaleToFit':
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: 'inside',
      });
      break;

    case 'width':
      if (!width) throw new Error('Width is required for sizing: width');
      sharpInstance = sharpInstance.resize({ width, fit: 'cover' });
      break;

    case 'height':
      if (!height) throw new Error('Height is required for sizing: height');
      sharpInstance = sharpInstance.resize({ height, fit: 'cover' });
      break;

    case 'crop':
      if (!width || !height)
        throw new Error('Width and height are required for sizing: crop');
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: 'cover',
        //position: getSharpPosition(center),
      });
      break;

    case 'fill':
      if (!width || !height)
        throw new Error('Width and height are required for sizing: fill');
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: 'fill',
      });
      break;

    default:
      throw new Error(`Unknown sizing method: ${sizing}`);
  }

  const outputFormat = toOutputFormat(format || 'png');
  // Set the output format and quality
  sharpInstance = (sharpInstance[outputFormat] as (args: any) => sharp.Sharp)({
    quality,
  });

  const buffer = await sharpInstance.toBuffer();
  const contentType = `imgage/${outputFormat.toString()}`;
  await writeObjectToS3(getMediaBucketName(), resizeKey, buffer, contentType);

  // Return the processed image as a buffer
  return { buffer, contentType, contentLength: (await buffer).length };
};

// Helper: Map `center` to Sharp's position enum
const getSharpPosition = (center: ImageResizeProps['center']) => {
  if (center === 'faces') {
    return 'attention'; // Sharp detects the most interesting part of the image
  } else if (center === 'center') {
    return 'center';
  } else if (typeof center === 'object') {
    // Custom position based on x, y percentages
    return { left: center.x, top: center.y };
  } else {
    throw new Error(`Unsupported center type: ${center}`);
  }
};

// Helper: Map format to Sharp output methods
const toOutputFormat = (
  format: SupportedImageFormatTypes
): keyof sharp.Sharp => {
  if (format === 'jpg') return 'jpeg';
  if (format === 'png') return 'png';
  throw new Error(`Unsupported format: ${format}`);
};
