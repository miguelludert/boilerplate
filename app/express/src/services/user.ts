import { Response } from "express";
import {
  addMediaToSource,
  deleteAllMediaForSource,
  getAllMediaBySource,
  resizeImage,
  sendMediaToResponse,
} from "./media";
import { getUsersTableName } from "../constants";
import { putItem, queryByKey } from "../utils/dynamo";

export interface AppUser {
  userId: string;
}

export const mediaSourceName = "users";
export enum MediaUsage {
  avatar = "avatar",
}

export const editUser = async (appUser: AppUser) => {
  const [user] = await queryByKey<AppUser>(getUsersTableName(), {
    name: "userId",
    value: appUser.userId,
  });
  const updatedUser = { ...user, ...appUser };
  await putItem(getUsersTableName(), updatedUser);
};

export const getUser = async (userId: string) => {
  const [user] = await queryByKey<AppUser>(getUsersTableName(), {
    name: "userId",
    value: userId,
  });
  return user as AppUser;
};

export const sendAvatarToResponse = async (userId: string, res: Response) => {
  const partitionKey = {
    sourceName: mediaSourceName,
    sourceId: userId,
    usage: MediaUsage.avatar,
  };
  const media = await getAllMediaBySource(partitionKey);
  if (media.length) {
    // media resize and get the hash

    try {
      const resizeResponse = await resizeImage(partitionKey, media[0].mediaId, {
        sizing: "crop",
        height: 200,
        width: 200,
      });
      if (!resizeResponse) {
        res.send(404);
        return;
      }

      const { buffer, contentLength, contentType } = resizeResponse!;

      res.set("Content-Length", contentLength.toString());
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=3600");
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
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
    sourceName: mediaSourceName,
    sourceId: userId,
    usage: MediaUsage.avatar,
  });
  const { mediaId, uploadUrl } = await addMediaToSource(
    userId,
    {
      sourceName: mediaSourceName,
      sourceId: userId,
      usage: MediaUsage.avatar,
    },
    fileName,
    fileType
  );
  return { mediaId, uploadUrl };
};
