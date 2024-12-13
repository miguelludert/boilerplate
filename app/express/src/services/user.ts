import { Response } from 'express';
import {
  addMediaToSource,
  deleteAllMediaForSource,
  getAllMediaBySource,
  resizeImage,
  sendMediaToResponse,
} from './media';
import {
  getCognitoClientId,
  getCognitoUserPoolId,
  getMediaBucketName,
  getUsersTableName,
} from '../constants';
import { getObjectAsBuffer } from '../utils/s3';
import { patchItem, putItem, queryByKey } from '../utils/dynamo';
import {
  updateCognitoUserEmailAndPassword,
  verifyUserPassword,
} from '../utils/cognito';

export interface AppUser {
  userId: string;
}

export const mediaSourceName = 'users';
export enum MediaUsage {
  avatar = 'avatar',
}

export const editUser = async (appUser: AppUser) => {
  const [user] = await queryByKey<AppUser>(getUsersTableName(), {
    name: 'userId',
    value: appUser.userId,
  });
  const updatedUser = { ...user, ...appUser };
  await putItem(getUsersTableName(), updatedUser);
};

export const getUser = async (userId: string) => {
  const [user] = await queryByKey<AppUser>(getUsersTableName(), {
    name: 'userId',
    value: userId,
  });
  return user as AppUser;
};

export const updateUserEmailAndPassword = async (
  userId: string,
  oldPassword: string,
  newPassword?: string,
  newEmail?: string
) => {
  const verified = await verifyUserPassword({
    userPoolId: getCognitoUserPoolId(),
    clientId: getCognitoClientId(),
    username: userId,
    password: oldPassword,
  });
  if (!verified) {
    throw Error('Not Authorized');
  }
  await updateCognitoUserEmailAndPassword({
    userPoolId: getCognitoUserPoolId(),
    username: userId,
    newEmail,
    newPassword,
  });
  if (newEmail) {
    await patchItem(
      getUsersTableName(),
      { userId },
      {
        email: newEmail,
      }
    );
  }
};

export const sendAvatarToResponse = async (userId: string, res: Response) => {
  const media = await getAllMediaBySource({
    sourceTableName: mediaSourceName,
    sourceId: userId,
    usage: MediaUsage.avatar,
  });
  if (media.length) {
    // media resize and get the hash

    const { buffer, contentLength, contentType } = await resizeImage(
      media[0].mediaId,
      {
        sizing: 'crop',
        height: 200,
        width: 200,
      }
    );
    console.info('sending');

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
