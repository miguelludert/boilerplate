import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getAwsRegion } from '../constants';

const cognitoClient = new CognitoIdentityProviderClient({
  region: getAwsRegion(),
});

interface VerifyPasswordParams {
  userPoolId: string;
  clientId: string;
  username: string;
  password: string;
}

export const verifyUserPassword = async ({
  userPoolId,
  clientId,
  username,
  password,
}: VerifyPasswordParams): Promise<boolean> => {
  try {
    const command = new AdminInitiateAuthCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    // If we receive an AuthenticationResult, the password is verified
    if (response.AuthenticationResult) {
      console.log('Password verified successfully.');
      return true;
    }

    return false;
  } catch (error: any) {
    console.log(error);
    if (error.name === 'NotAuthorizedException') {
      console.error('Invalid username or password.');
      return false;
    }
    console.error('Error verifying password:', error);
    throw new Error('Failed to verify user password.');
  }
};

interface UpdateUserParams {
  userPoolId: string;
  username: string;
  newEmail?: string;
  newPassword?: string;
}

export const updateCognitoUserEmailAndPassword = async ({
  userPoolId,
  username,
  newEmail,
  newPassword,
}: UpdateUserParams): Promise<void> => {
  const UserAttributes = [];

  try {
    if (newEmail) {
      // Update email
      const updateEmailCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [
          {
            Name: 'email',
            Value: newEmail,
          },
          {
            Name: 'email_verified',
            Value: 'false',
          },
        ],
      });
      await cognitoClient.send(updateEmailCommand);
      console.log('Email updated successfully.');
    }

    if (newPassword) {
      // Update password
      const updatePasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
        Password: newPassword,
        Permanent: true, // Permanent sets it as the user's new password
      });
      await cognitoClient.send(updatePasswordCommand);
      console.log('Password updated successfully.');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user email and password.');
  }
};
