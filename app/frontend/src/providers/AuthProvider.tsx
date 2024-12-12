import { Amplify, ResourcesConfig } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { createContext, useContext } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import { getApiEndoint } from '../constants';
import { fetchImageAsDataUrl } from '../utils/fetchImageAsDataUrl';

axios.interceptors.request.use(async (config) => {
  const token = await getJwtToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

const {
  VITE_COGNITO_USER_POOL_ID: userPoolId,
  VITE_COGNITO_CLIENT_ID: userPoolClientId,
} = import.meta.env;

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
    },
  },
};

Amplify.configure(awsConfig);
const AuthContext = createContext<AppUser>({} as AppUser);

const setCookie = (name: string, value: string, days?: number): void => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
};

async function getJwtToken() {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    setCookie('authToken', (idToken ?? '').toString());
    return idToken;
  } catch (error) {
    console.error('Error getting JWT:', error);
    throw new Error('User is not authenticated');
  }
}

const getUserQueryFn = async () => {
  const { data } = await axios(getApiEndoint('/user'));
  return data as AppUserData;
};

const saveDataMutationFn = async (data: AppUserData) => {
  try {
    await axios.post(getApiEndoint('/user'), data);
  } catch (error) {
    console.error('Error posting user data:', error);
    throw error;
  }
};

const saveEmailAndPasswordMutationFn = async ({
  oldPassword,
  email,
  newPassword,
}: {
  oldPassword: string;
  email?: string;
  newPassword?: string;
}) => {
  try {
    await axios.post(getApiEndoint('/user/security'), {
      oldPassword,
      email,
      newPassword,
    });
  } catch (error) {
    console.error('Error posting user data:', error);
    throw error;
  }
};

const uploadAvatarMutationFn = async ({ file }: { file: File }) => {
  const response = await axios.post(getApiEndoint('/user/avatar'), {
    fileName: file.name,
    fileType: file.type,
  });
  const uploadUrl = response.data.uploadUrl;
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};

export const useCurrentUser = () => {
  return useContext(AuthContext);
};

const fetchAvatarMutationFn = async () => {
  try {
    return await fetchImageAsDataUrl(getApiEndoint('/user/avatar'));
  } catch (error) {
    console.error(error);
  }
};

export function AuthProviderContent({
  signOut,
  children,
}: {
  signOut?: () => void;
  children: React.ReactElement;
}) {
  // avatar
  const { data: avatarDataUrl, refetch: reloadAvatarQuery } = useQuery({
    queryKey: ['current-user-avatar'],
    queryFn: fetchAvatarMutationFn,
  });
  const avatar = avatarDataUrl ? avatarDataUrl : '/icons/user.svg';
  const reloadAvatar = async () => {
    await reloadAvatarQuery();
  };

  // get user data
  const { data: userData, refetch: refetchUserQuery } = useQuery({
    queryKey: ['current-user'],
    queryFn: getUserQueryFn,
  });
  const refetchUser = async () => {
    await refetchUserQuery();
  };

  // save user data
  const { mutateAsync: saveDataMutateAsync } = useMutation({
    mutationFn: saveDataMutationFn,
  });
  const saveData = async (data: AppUserData) => {
    await saveDataMutateAsync(data);
    await refetchUser();
  };

  // save email password
  const { mutateAsync: saveEmailAndPasswordMutateAsync } = useMutation({
    mutationFn: saveEmailAndPasswordMutationFn,
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
    mutationFn: uploadAvatarMutationFn,
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

export function AuthProvider({ children }: { children: React.ReactElement }) {
  return (
    <Authenticator>
      {({ ...props }) => (
        <AuthProviderContent {...props}>{children}</AuthProviderContent>
      )}
    </Authenticator>
  );
}
