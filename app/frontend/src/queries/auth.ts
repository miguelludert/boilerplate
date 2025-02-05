/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AppUserData,
  AuthProviderQueryFn,
} from "@miguelludert/frontend-common";
import { getApiEndpoint } from "../constants";
import { fetchImageAsDataUrl } from "../utils/fetchImageAsDataUrl";
import axios from "axios";
import { storeDelete, storeGet, storeSet } from "../utils/store";

interface AppSession {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

axios.interceptors.request.use((config) => {
  const appSession = storeGet<AppSession>("appSession");
  if (appSession && appSession.idToken) {
    const token = appSession.idToken;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleSignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  try {
    const response = await axios.post(getApiEndpoint(`/auth/sign-in`), {
      email,
      password,
    });
    const { accessToken, refreshToken, idToken } = response.data;
    storeSet("appSession", { accessToken, refreshToken, idToken });
  } catch (error: any) {
    console.error(error);
    console.error("Sign-in error:", error.message);
    throw new Error("Sign-in failed.");
  }
};

const handleSignOut = async () => {
  storeDelete("appSession");
};

const handleUploadAvatarMutationFn = async ({ file }: { file: File }) => {
  const { name: fileName, type: fileType } = file;
  const response = await axios.post(getApiEndpoint("/user/avatar"), {
    fileName,
    fileType,
  });
  const uploadUrl = response.data.uploadUrl;
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": fileType,
    },
  });
};

const handleGetAvatarMutationFn = async () => {
  try {
    return await fetchImageAsDataUrl(getApiEndpoint("/user/avatar"));
  } catch (error) {
    console.error(error);
    return;
  }
};

const handleGetUserDataQueryFn = async () => {
  // Fetch user data logic
  try {
    const { data } = await axios.get(getApiEndpoint(`/user`));
    return data;
  } catch (error: any) {
    if (error.status === 401) {
      return null;
    }
    console.error("Get User error:", error.message);
    throw new Error("Get User request failed.");
  }
};

const handleCreateAccount = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await axios.post(getApiEndpoint(`/auth/create`), {
      email,
      password,
    });
  } catch (error: any) {
    console.error("Create account error:", error.message);
    throw new Error("Account creation failed.");
  }
};

export const handleSaveUserDataMutationFn = async (data: AppUserData) => {
  try {
    await axios.post(getApiEndpoint(`/user`), data);
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    throw new Error("Forgot password request failed.");
  }
};

export const handleSaveEmailAndPasswordMutationFn = async ({
  oldPassword,
  email,
  newPassword,
}: {
  oldPassword: string;
  email?: string;
  newPassword?: string;
}) => {
  if (oldPassword === newPassword) {
    await axios.post(getApiEndpoint(`/user/security`), { email, newPassword });
  }
};

export const handleForgotPassword = async ({ email }: { email: string }) => {
  try {
    await axios.post(getApiEndpoint(`/auth/forgotPassword`), { email });
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    throw new Error("Forgot password request failed.");
  }
};

export const authQueryFn: AuthProviderQueryFn = {
  // AuthenticatorProps methods
  handleSignIn,
  handleSignOut,
  handleGetUserDataQueryFn,
  handleCreateAccount,
  handleSaveUserDataMutationFn,
  handleSaveEmailAndPasswordMutationFn,
  handleForgotPassword,
  handleUploadAvatarMutationFn,
  handleGetAvatarMutationFn,
} as AuthProviderQueryFn;
