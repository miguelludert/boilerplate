import React from "react";
import { AuthComponent } from "./AuthComponent";
import { useCurrentUser } from "../../providers/AuthProvider";

export interface AuthenticatorProps {
  children: any;
}

export const Authenticator: React.FC<AuthenticatorProps> = ({ children }) => {
  const { appUserData, signIn, createAccount, forgotPassword } =
    useCurrentUser();
  if (!appUserData) {
    return (
      <AuthComponent
        onSignIn={signIn}
        onCreateAccount={createAccount}
        onForgotPassword={forgotPassword}
      />
    );
  }
  return children;
};
