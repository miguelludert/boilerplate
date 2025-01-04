import React, { useState } from 'react';
import { AuthComponent } from './AuthComponent';

export interface User {
  id: string;
  email: string;
}

export interface AuthenticatorHandlers {
  handleSignIn: (email: string, password: string) => Promise<User>;
  handleCreateAccount: (email: string, password: string) => Promise<User>;
  handleForgotPassword: (email: string) => Promise<void>;
}
export interface AuthenticatorProps extends AuthenticatorHandlers {
  render: (props: { user: User; signOut: () => void }) => React.ReactNode;
}

export const Authenticator: React.FC<AuthenticatorProps> = ({
  render,
  handleSignIn,
  handleCreateAccount,
  handleForgotPassword,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const handleSignOut = (): void => {
    setUser(null);
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    const userData = await handleSignIn(email, password);
    setUser(userData);
  };

  const createAccount = async (
    email: string,
    password: string
  ): Promise<void> => {
    const userData = await handleCreateAccount(email, password);
    setUser(userData);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    await handleForgotPassword(email);
  };

  if (!user) {
    return (
      <AuthComponent
        onSignIn={signIn}
        onCreateAccount={createAccount}
        onForgotPassword={forgotPassword}
      />
    );
  }

  return <>{render({ user, signOut: handleSignOut })}</>;
};
