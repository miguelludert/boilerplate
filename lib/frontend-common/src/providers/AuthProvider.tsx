import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

export interface AuthProviderQueryFn {
  handleSaveUserDataMutationFn: (data: AppUserData) => Promise<void>;
  handleGetUserDataQueryFn: () => Promise<AppUserData>;
  handleSaveEmailAndPasswordMutationFn: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;
  handleUploadAvatarMutationFn: (args: { file: File }) => Promise<void>;
  handleGetAvatarMutationFn: () => Promise<string>;
  handleSignOut: () => Promise<void>;
  handleSignIn: (args: { email: string; password: string }) => Promise<void>;
  handleCreateAccount: (args: {
    email: string;
    password: string;
  }) => Promise<void>;
  handleForgotPassword: (args: { email: string }) => Promise<void>;
}

export interface AppUserData {
  userId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface AppUser {
  appUserData?: AppUserData;
  refetchUser: () => Promise<unknown>;
  saveUserData: (data: AppUserData) => Promise<void>;
  saveEmailAndPassword: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;

  // login
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;

  // avatar
  avatar?: string;
  reloadAvatar: () => Promise<void>;
  uploadAvatar: (args: { file: File }) => Promise<void>;
}

const AuthContext = createContext<AppUser>({} as AppUser);

export const useCurrentUser = () => {
  return useContext(AuthContext);
};

export function AuthProvider({
  authQueryFn,
  children,
}: {
  authQueryFn: AuthProviderQueryFn;
  children: React.ReactElement;
}) {
  const {
    handleGetAvatarMutationFn,
    handleGetUserDataQueryFn,
    handleSaveUserDataMutationFn,
    handleSaveEmailAndPasswordMutationFn,
    handleUploadAvatarMutationFn,
    handleSignIn,
    handleSignOut,
    handleCreateAccount,
    handleForgotPassword,
  } = authQueryFn;

  const queryClient = useQueryClient();

  const invalidateCurrentUser = () =>
    queryClient.invalidateQueries({ queryKey: ["current-user"], exact: false });

  // get user data
  const { data: appUserData } = useQuery({
    queryKey: ["current-user", "data"],
    queryFn: handleGetUserDataQueryFn,
  });
  // avatar
  const { data: avatarDataUrl } = useQuery({
    queryKey: ["current-user", "avatar"],
    queryFn: handleGetAvatarMutationFn,
    enabled: !!appUserData,
  });
  const avatar = avatarDataUrl ? avatarDataUrl : "/icons/user.svg";

  const { mutateAsync: signInAsync } = useMutation({
    mutationFn: handleSignIn,
    onSuccess: invalidateCurrentUser,
  });
  const { mutateAsync: signOutAsync } = useMutation({
    mutationFn: handleSignOut,
    onSuccess: invalidateCurrentUser,
  });
  const { mutateAsync: createAccountAsync } = useMutation(handleCreateAccount);
  const { mutateAsync: forgotPasswordAsync } =
    useMutation(handleForgotPassword);

  const { mutateAsync: saveDataMutateAsync } = useMutation({
    mutationFn: handleSaveUserDataMutationFn,
    onSuccess: invalidateCurrentUser,
  });
  const { mutateAsync: saveEmailAndPasswordAsync } = useMutation({
    mutationFn: handleSaveEmailAndPasswordMutationFn,
  });
  const { mutateAsync: uploadAvatarAsync } = useMutation({
    mutationFn: handleUploadAvatarMutationFn,
    onSuccess: invalidateCurrentUser,
  });

  return (
    <AuthContext.Provider
      value={{
        appUserData,
        saveUserData: saveDataMutateAsync,
        saveEmailAndPassword: saveEmailAndPasswordAsync,
        refetchUser: () =>
          queryClient.invalidateQueries(["current-user", "data"]),

        // login
        async signIn(email: string, password: string) {
          await signInAsync({ email, password });
        },
        async signOut() {
          await signOutAsync();
          console.info("signOutAsync");
        },
        async createAccount(email: string, password: string) {
          await createAccountAsync({ email, password });
        },
        async forgotPassword(email: string) {
          await forgotPasswordAsync({ email });
        },

        // avatar
        avatar,
        reloadAvatar: () =>
          queryClient.invalidateQueries(["current-user", "avatar"]),
        async uploadAvatar({ file }: { file: File }) {
          await uploadAvatarAsync({
            file,
          });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
