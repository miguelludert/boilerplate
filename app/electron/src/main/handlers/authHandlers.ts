import axios from "axios";
import { ipcMain } from "electron";
import { getApiEndpoint } from "../constants";
import { storeDelete, storeGet, storeSet } from "../utils/store";

export interface SignInArgs {
  email: string;
  password: string;
}

export interface CreateAccountArgs {
  email: string;
  password: string;
}

export interface ForgotPasswordArgs {
  email: string;
}

export interface SaveEmailAndPasswordArgs {
  oldPassword: string;
  email?: string;
  newPassword?: string;
}

export interface UploadAvatarArgs {
  file: File;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export interface AppUserData {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}

export interface SignInArgs {
  email: string;
  password: string;
}

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

axios.interceptors.response.use(
  (response) => {
    // If the response is successful, just return the response
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request detected. Clearing appSession.");
      storeDelete("appSession");
    }
    // Reject the promise so the error can be handled elsewhere
    return Promise.reject(error);
  },
);

// Handlers
ipcMain.handle(
  "handleSignIn",
  async (event, args: SignInArgs): Promise<void> => {
    const { email, password } = args;
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
  },
);

ipcMain.handle(
  "handleCreateAccount",
  async (event, args: CreateAccountArgs): Promise<void> => {
    const { email, password } = args;
    try {
      await axios.post(getApiEndpoint(`/auth/create`), {
        email,
        password,
      });
    } catch (error: any) {
      console.error("Create account error:", error.message);
      throw new Error("Account creation failed.");
    }
  },
);

ipcMain.handle(
  "handleForgotPassword",
  async (event, args: ForgotPasswordArgs): Promise<void> => {
    const { email } = args;

    try {
      await axios.post(getApiEndpoint(`/auth/forgotPassword`), { email });
    } catch (error: any) {
      console.error("Forgot password error:", error.message);
      throw new Error("Forgot password request failed.");
    }
  },
);

ipcMain.handle(
  "handleSaveUserDataMutationFn",
  async (event, data: AppUserData): Promise<void> => {
    // Save user data logic
  },
);

ipcMain.handle(
  "handleGetUserDataQueryFn",
  async (): Promise<AppUserData | null> => {
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
  },
);

ipcMain.handle(
  "handleSaveEmailAndPasswordMutationFn",
  async (event, args: SaveEmailAndPasswordArgs): Promise<void> => {
    //const { oldPassword, email, newPassword } = args;
    // Update email/password logic
  },
);

ipcMain.handle(
  "handleUploadAvatarMutationFn",
  async (event, args: UploadAvatarArgs): Promise<void> => {
    const { file } = args;
    // Upload avatar logic
  },
);

ipcMain.handle("handleGetAvatarMutationFn", async (): Promise<string> => {
  // Fetch avatar logic
  return "avatar.png";
});

ipcMain.handle("handleSignOut", async (): Promise<void> => {
  storeDelete("appSession");
});
