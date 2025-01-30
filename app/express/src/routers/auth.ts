import { Router } from "express";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { AppRequest } from "../types";

const { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = process.env;

if (!COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
  throw new Error(
    "Cognito configuration is missing. Check environment variables."
  );
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
}); // Replace with your AWS region

export const authRouter = Router();

// Sign-In Route
authRouter.post("/sign-in", async (req: AppRequest, res: any) => {
  const { email, password } = req.body;

  try {
    const authCommand = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(authCommand);

    if (!response.AuthenticationResult) {
      throw new Error("Authentication failed.");
    }

    res.json({
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
    });
  } catch (error: any) {
    console.error("Sign-In Error:", error.message);
    res.status(401).json({ message: "Invalid email or password." });
  }
});

// Sign-Out Route
authRouter.post("/sign-out", async (req: AppRequest, res: any) => {
  const { accessToken } = req.body;

  try {
    const signOutCommand = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(signOutCommand);

    res.json({ message: "Signed out successfully." });
  } catch (error: any) {
    console.error("Sign-Out Error:", error.message);
    res.status(500).json({ message: "Sign-out failed." });
  }
});

// Create User Route
authRouter.post("/create", async (req: AppRequest, res: any) => {
  const { email, password } = req.body;

  try {
    const signUpCommand = new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
    });

    const response = await cognitoClient.send(signUpCommand);

    res.json({
      message: "User created successfully.",
      userSub: response.UserSub,
    });
  } catch (error: any) {
    console.error("Create User Error:", error.message);
    res.status(500).json({ message: "User creation failed." });
  }
});

// Forgot Password Route
authRouter.post("/forgotPassword", async (req: AppRequest, res: any) => {
  const { email } = req.body;

  try {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID!,
      Username: email,
    });

    await cognitoClient.send(forgotPasswordCommand);

    res.json({ message: "Password reset email sent." });
  } catch (error: any) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ message: "Failed to initiate password reset." });
  }
});
