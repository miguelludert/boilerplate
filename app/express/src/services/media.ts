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
  sendObjectStreamToResponse,
} from '../utils/s3';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';

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

export interface ImageResizeProps {
  format: 'jpg' | 'png';
  quality: number;
  sizing: 'scaleToFit' | 'width' | 'height' | 'crop' | 'fill';
  center: { x: number; y: number } | 'faces' | 'center';
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

export const queueImageResize = async (
  mediaId: string,
  resizeProps: ImageResizeProps
) => {
  throw 'not implemented';
};
