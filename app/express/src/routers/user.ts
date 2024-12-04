import { Response, Router } from 'express';
import { AppRequest } from '../types';
import urlJoin from 'url-join';
import {
  addMediaToSource,
  getAllMediaBySource,
  sendMediaToResponse,
} from '../services/media';
import {
  editUser,
  getAvatarUploadUrl,
  getUser,
  mediaSourceName,
  MediaUsage,
  sendAvatarToResponse,
} from '../services/user';
import { createUploadUrl } from '../utils/s3';

interface EditableUserFields {
  firstName: string;
  lastName: string;
}

export const userRouter = Router();

// get current user
userRouter.get('/', async (req: AppRequest, res: any) => {
  const user = await getUser(req.user.sub);
  res.json(user);
});

// edit current user
userRouter.post('/', async (req: AppRequest, res: any) => {
  const body = req.body as EditableUserFields;
  const id = req.user.sub;
  await editUser(id, body);
  res.json('OK').send();
});

// get current user's avatar
userRouter.get('/avatar', async (req: AppRequest, res: any) => {
  await sendAvatarToResponse(req.user.sub, res);
});

userRouter.post('/avatar', async (req: AppRequest, res: any) => {
  const { mediaId, uploadUrl } = await getAvatarUploadUrl(
    req.user.sub,
    req.body.fileName,
    req.body.fileType
  );
  res.json({
    mediaId,
    uploadUrl,
  });
});
