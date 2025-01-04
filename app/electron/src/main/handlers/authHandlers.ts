import { ipcMain } from "electron";

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

// Handlers
ipcMain.handle(
  "handleSignIn",
  async (event, args: SignInArgs): Promise<User> => {
    const { email, password } = args;

    console.info("email", email);
    console.info("password", password);

    return { id: "1", email, name: "User", avatarUrl: "avatar.png" };
  },
);

ipcMain.handle(
  "handleCreateAccount",
  async (event, args: CreateAccountArgs): Promise<User> => {
    const { email, password } = args;
    // Implement create account logic
    return { id: "2", email, name: "New User", avatarUrl: "avatar.png" };
  },
);

ipcMain.handle(
  "handleForgotPassword",
  async (event, args: ForgotPasswordArgs): Promise<void> => {
    const { email } = args;
    // Implement forgot password logic
  },
);

ipcMain.handle(
  "handleSaveUserDataMutationFn",
  async (event, data: AppUserData): Promise<void> => {
    // Save user data logic
  },
);

ipcMain.handle("handleGetUserDataQueryFn", async (): Promise<AppUserData> => {
  // Fetch user data logic
  return { id: "1", name: "User", email: "user@example.com" };
});

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
