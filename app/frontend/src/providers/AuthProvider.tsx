import { Amplify, ResourcesConfig } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { createContext, useContext } from 'react';
import { AuthUser } from 'aws-amplify/auth';

export interface AuthContextType {
  signOut?: () => void;
  user?: AuthUser;
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
const AuthContext = createContext<AuthContextType>({});

export const useUser = () => {
  const { signOut, user } = useContext(AuthContext);
  console.info(user);

  return {
    logout: signOut,
    avatar: '/icons/user.svg',
    email: 'generic@user.org',
    displayName: 'Generic User',
  };
};

export function AuthProvider({ children }: { children: React.ReactElement }) {
  return (
    <Authenticator>
      {({ signOut, user }) => {
        return (
          <AuthContext.Provider value={{ signOut, user }}>
            {children}
          </AuthContext.Provider>
        );
      }}
    </Authenticator>
  );
}
