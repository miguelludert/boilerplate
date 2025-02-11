import { NextFunction, Request, Response, Router } from "express";
import { AppRequest } from "../types";
import {
  editUser,
  getAvatarUploadUrl,
  getUser,
  sendAvatarToResponse,
  updateUserEmailAndPassword,
} from "../services/user";
import { validateJwt } from "../utils/auth";

interface EditableUserFields {
  firstName: string;
  lastName: string;
}

export const userRouter = Router();

userRouter.use((req: Request, res: Response, next: NextFunction) => {
  const appRequest = req as AppRequest;
  appRequest.user = {
    id: "local-user",
    sub: "local-user",
  };
  next();
});

// get current user
userRouter.get("/", async (req: AppRequest, res: any) => {
  const user = await getUser(req.user.sub);
  res.json({ ...user });
});

// edit current user
userRouter.post("/", async (req: AppRequest, res: any) => {
  const body = req.body as EditableUserFields;
  const userId = req.user.sub;
  await editUser({ ...body, userId });
  res.json("OK");
});

// get current user's avatar
userRouter.get("/avatar", async (req: AppRequest, res: any) => {
  await sendAvatarToResponse(req.user.sub, res);
});

userRouter.post("/avatar", async (req: AppRequest, res: any) => {
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
