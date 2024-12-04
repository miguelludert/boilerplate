import { Amplify, ResourcesConfig } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthUser } from 'aws-amplify/auth';
import axios from 'axios';
import { useQuery } from 'react-query';
import { getApiEndoint } from '../constants';

axios.interceptors.request.use(async (config) => {
  const token = await getJwtToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AppUserData {
  id: string;
  avatar?: string;
  email: string;
  displayName: string;
  logout?: () => void;
  reloadAvatar: () => void;
}

export interface AuthContextType {
  signOut?: () => void;
  user?: AuthUser;
  avatar?: string;
  reloadAvatar: () => void;
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
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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

export const useUser = () => {
  const { signOut, user, avatar, reloadAvatar } = useContext(AuthContext);
  const userQueryFunction = async () => {
    const { data } = await axios(getApiEndoint('/user'));
    return data as AppUserData;
  };
  const { data } = useQuery({
    queryKey: ['current-user'],
    queryFn: userQueryFunction,
  });
  return {
    ...data,
    logout: signOut,
    id: user!.username,
    avatar,
    reloadAvatar,
  } as AppUserData;
};

/**
 * Fetches an image from the given URL and converts it into a Data URL.
 * @param imageUrl - The URL of the image to fetch.
 * @returns A promise that resolves to the Data URL string.
 */
const fetchImageAsDataUrl = async (imageUrl: string): Promise<string> => {
  try {
    // Fetch the image as a binary blob
    const response = await axios.get(imageUrl, {
      responseType: 'blob', // Fetch the image as a Blob
    });

    const blob = response.data;

    // Convert the blob to a Data URL using FileReader
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject(new Error('Failed to convert blob to Data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch the image');
  }
};

export function AuthProvider({ children }: { children: React.ReactElement }) {
  const userAvatarUrl = getApiEndoint('/user/avatar');
  const [avatar, setAvatar] = useState<string | undefined>('/icons/user.svg');
  const reloadAvatar = useCallback(async () => {
    try {
      const dataUrl = await fetchImageAsDataUrl(userAvatarUrl);
      setAvatar(dataUrl);
    } catch (error) {
      console.error(error);
    }
  }, [setAvatar, userAvatarUrl]);
  useEffect(() => {
    reloadAvatar();
  }, [reloadAvatar]);

  return (
    <Authenticator>
      {({ signOut, user }) => {
        return (
          <AuthContext.Provider value={{ signOut, user, avatar, reloadAvatar }}>
            {children}
          </AuthContext.Provider>
        );
      }}
    </Authenticator>
  );
}
