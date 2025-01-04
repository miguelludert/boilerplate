import {
  Authenticator,
  AuthenticatorHandlers,
} from '../components/Authenticator';
import { createContext, useContext } from 'react';
import { useMutation, useQuery } from 'react-query';

export interface AuthProviderQueryFn extends AuthenticatorHandlers {
  handleSaveUserDataMutationFn: (data: AppUserData) => Promise<void>;
  handleGetUserDataQueryFn: () => Promise<AppUserData>;
  handleSaveEmailAndPasswordMutationFn: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;
  handleUploadAvatarMutationFn: (args: { file: File }) => Promise<void>;
  handleGetAvatarMutationFn: () => Promise<string>;
}

export interface AppUserData {
  userId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface AppUser {
  userData: AppUserData;
  logout?: () => void;
  refetchUser: () => Promise<unknown>;
  saveUserData: (data: AppUserData) => Promise<void>;
  saveEmailAndPassword: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;
  signOut?: () => void;

  // avatar
  avatar?: string;
  reloadAvatar: () => Promise<void>;
  uploadAvatar: (args: { file: File }) => Promise<void>;
}

const AuthContext = createContext<AppUser>({} as AppUser);

export const useCurrentUser = () => {
  return useContext(AuthContext);
};

export function AuthProviderContent({
  authQueryFn,
  signOut,
  children,
}: {
  authQueryFn: AuthProviderQueryFn;
  signOut?: () => void;
  children: React.ReactElement;
}) {
  const {
    handleGetAvatarMutationFn,
    handleGetUserDataQueryFn,
    handleSaveUserDataMutationFn,
    handleSaveEmailAndPasswordMutationFn,
    handleUploadAvatarMutationFn,
  } = authQueryFn;

  // avatar
  const { data: avatarDataUrl, refetch: reloadAvatarQuery } = useQuery({
    queryKey: ['current-user-avatar'],
    queryFn: handleGetAvatarMutationFn,
  });
  const avatar = avatarDataUrl ? avatarDataUrl : '/icons/user.svg';
  const reloadAvatar = async () => {
    await reloadAvatarQuery();
  };

  // get user data
  const { data: userData, refetch: refetchUserQuery } = useQuery({
    queryKey: ['current-user'],
    queryFn: handleGetUserDataQueryFn,
  });
  const refetchUser = async () => {
    await refetchUserQuery();
  };

  // save user data
  const { mutateAsync: saveDataMutateAsync } = useMutation({
    mutationFn: handleSaveUserDataMutationFn,
  });
  const saveData = async (data: AppUserData) => {
    await saveDataMutateAsync(data);
    await refetchUser();
  };

  // save email password
  const { mutateAsync: saveEmailAndPasswordMutateAsync } = useMutation({
    mutationFn: handleSaveEmailAndPasswordMutationFn,
  });
  const saveEmailAndPassword = async (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => {
    await saveEmailAndPasswordMutateAsync(args);
  };

  // up0load avatar
  const { mutateAsync: uploadAvatarMutateAsync } = useMutation({
    mutationFn: handleUploadAvatarMutationFn,
  });
  const uploadAvatar = async (args: { file: File }) => {
    await uploadAvatarMutateAsync(args);
    await reloadAvatar();
  };

  return (
    <AuthContext.Provider
      value={{
        userData: userData ?? ({} as AppUserData),
        saveUserData: saveData,
        saveEmailAndPassword,
        refetchUser,
        signOut,

        // avatar
        avatar,
        reloadAvatar: async () => {
          await reloadAvatar();
        },
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({
  children,
  authQueryFn,
}: {
  authQueryFn: AuthProviderQueryFn;
  children: React.ReactElement;
}) {
  const { handleCreateAccount, handleForgotPassword, handleSignIn } =
    authQueryFn;
  return (
    <Authenticator
      {...{ handleCreateAccount, handleForgotPassword, handleSignIn }}
      render={({ ...props }) => (
        <AuthProviderContent authQueryFn={authQueryFn} {...props}>
          {children}
        </AuthProviderContent>
      )}
    ></Authenticator>
  );
}
