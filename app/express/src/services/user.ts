import { Response } from 'express';
import {
  addMediaToSource,
  deleteAllMediaForSource,
  getAllMediaBySource,
  sendMediaToResponse,
} from './media';
import { getMediaBucketName } from '../constants';
import { getObjectAsBuffer } from '../utils/s3';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface AppUser {
  userId: string;
}

export const mediaSourceName = 'users';
export enum MediaUsage {
  avatar = 'avatar',
}

export const editUser = (userId: string, appUser: Omit<AppUser, 'userId'>) => {
  // change emailin cognito
  // change data in dynamo
};

export const getUser = (userId: string): AppUser => {
  return {
    userId,
  } as AppUser;
};

export const changeSecurity = (
  userId: string,
  oldPassword: string,
  newPassword?: string,
  email?: string
) => {
  // check password
  // update password
};

export const sendAvatarToResponse = async (userId: string, res: Response) => {
  const media = await getAllMediaBySource({
    sourceTableName: mediaSourceName,
    sourceId: userId,
    usage: MediaUsage.avatar,
  });
  if (media.length) {
    // media resize and get the hash
    const { buffer, contentLength, contentType } = await getObjectAsBuffer(
      getMediaBucketName(),
      media[0].mediaId
    );
    res.set('Content-Length', contentLength.toString());
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } else {
    res.sendStatus(404);
  }
};

export const getAvatarUploadUrl = async (
  userId: string,
  fileName: string,
  fileType: string
) => {
  await deleteAllMediaForSource({
    sourceTableName: mediaSourceName,
    sourceId: userId,
    usage: MediaUsage.avatar,
  });
  const { mediaId, uploadUrl } = await addMediaToSource(
    userId,
    {
      sourceTableName: mediaSourceName,
      sourceId: userId,
      usage: MediaUsage.avatar,
    },
    fileName,
    fileType
  );
  return { mediaId, uploadUrl };
};
