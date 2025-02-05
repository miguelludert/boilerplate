/**
 * This file provides the authentication context for the application.
 * It defines interfaces and functions to manage user authentication and profile data,
 * utilizing react-query to perform asynchronous operations such as fetching user data,
 * signing in/out, account creation, password reset, and avatar updates.
 *
 * The AuthProvider component wraps your application and provides authentication-related functionalities
 * via the context. The context is accessed through the `useCurrentUser` hook.
 *
 * By abstracting the authentication operations into an `AuthProviderQueryFn` interface, the UI is decoupled
 * from the implementation details of these operations.
 */

import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

/**
 * Interface for authentication-related query and mutation functions.
 *
 * This interface defines the methods that interact with backend services (or any asynchronous source)
 * for performing authentication operations.
 *
 * @interface AuthProviderQueryFn
 */
export interface AuthProviderQueryFn {
  /**
   * Saves user data.
   *
   * @param data - The user data to be saved.
   * @returns A promise that resolves when the operation is complete.
   */
  handleSaveUserDataMutationFn: (data: AppUserData) => Promise<void>;

  /**
   * Retrieves the user data.
   *
   * @returns A promise that resolves with the user data.
   */
  handleGetUserDataQueryFn: () => Promise<AppUserData>;

  /**
   * Updates the user's email and/or password.
   *
   * @param args - An object containing the old password, and optionally new email and/or new password.
   * @returns A promise that resolves when the operation is complete.
   */
  handleSaveEmailAndPasswordMutationFn: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;

  /**
   * Uploads a new avatar for the user.
   *
   * @param args - An object containing the avatar file to be uploaded.
   * @returns A promise that resolves when the operation is complete.
   */
  handleUploadAvatarMutationFn: (args: { file: File }) => Promise<void>;

  /**
   * Retrieves the user's avatar URL.
   *
   * @returns A promise that resolves with the avatar URL.
   */
  handleGetAvatarMutationFn: () => Promise<string>;

  /**
   * Signs the user out.
   *
   * @returns A promise that resolves when the sign out is complete.
   */
  handleSignOut: () => Promise<void>;

  /**
   * Signs the user in.
   *
   * @param args - An object containing the user's email and password.
   * @returns A promise that resolves when the sign in is successful.
   */
  handleSignIn: (args: { email: string; password: string }) => Promise<void>;

  /**
   * Creates a new user account.
   *
   * @param args - An object containing the email and password for the new account.
   * @returns A promise that resolves when the account creation is complete.
   */
  handleCreateAccount: (args: {
    email: string;
    password: string;
  }) => Promise<void>;

  /**
   * Initiates the forgot password flow.
   *
   * @param args - An object containing the email of the user.
   * @returns A promise that resolves when the process is initiated.
   */
  handleForgotPassword: (args: { email: string }) => Promise<void>;
}

/**
 * Interface representing the user's data.
 *
 * @interface AppUserData
 */
export interface AppUserData {
  userId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

/**
 * Interface representing the authenticated user and associated actions.
 *
 * This includes user data as well as functions for refetching data, updating credentials,
 * and managing authentication state (e.g. sign in, sign out, and avatar updates).
 *
 * @interface AppUser
 */
export interface AppUser {
  /**
   * The authenticated user's data.
   */
  appUserData?: AppUserData;

  /**
   * Refetches the current user data.
   *
   * @returns A promise that resolves when the data is refreshed.
   */
  refetchUser: () => Promise<unknown>;

  /**
   * Saves updated user data.
   *
   * @param data - The new user data.
   * @returns A promise that resolves when the operation is complete.
   */
  saveUserData: (data: AppUserData) => Promise<void>;

  /**
   * Updates the user's email and/or password.
   *
   * @param args - An object containing the old password, and optionally new email and/or new password.
   * @returns A promise that resolves when the operation is complete.
   */
  saveEmailAndPassword: (args: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => Promise<void>;

  // Login-related functions

  /**
   * Signs the user in.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves when the sign in is successful.
   */
  signIn: (email: string, password: string) => Promise<void>;

  /**
   * Signs the user out.
   *
   * @returns A promise that resolves when the sign out is complete.
   */
  signOut: () => Promise<void>;

  /**
   * Creates a new user account.
   *
   * @param email - The email address for the new account.
   * @param password - The password for the new account.
   * @returns A promise that resolves when the account creation is complete.
   */
  createAccount: (email: string, password: string) => Promise<void>;

  /**
   * Initiates the forgot password flow.
   *
   * @param email - The email address associated with the account.
   * @returns A promise that resolves when the process is initiated.
   */
  forgotPassword: (email: string) => Promise<void>;

  // Avatar-related properties and functions

  /**
   * The URL of the user's avatar image.
   */
  avatar?: string;

  /**
   * Reloads the user's avatar.
   *
   * @returns A promise that resolves when the avatar has been refreshed.
   */
  reloadAvatar: () => Promise<void>;

  /**
   * Uploads a new avatar for the user.
   *
   * @param args - An object containing the new avatar file.
   * @returns A promise that resolves when the upload is complete.
   */
  uploadAvatar: (args: { file: File }) => Promise<void>;
}

/**
 * Creates the authentication context.
 *
 * This context holds the authenticated user data and associated functions.
 * It is initialized with an empty object cast as AppUser.
 */
const AuthContext = createContext<AppUser>({} as AppUser);

/**
 * Custom hook to access the current authenticated user.
 *
 * @returns {AppUser} The authenticated user and associated authentication functions.
 * @throws Will throw an error if used outside of an AuthProvider.
 *
 * @example
 * const { appUserData, signIn } = useCurrentUser();
 */
export const useCurrentUser = () => {
  return useContext(AuthContext);
};

/**
 * AuthProvider component.
 *
 * Wraps your application and provides authentication context to its child components.
 * It leverages react-query hooks to manage asynchronous operations (fetching user data,
 * signing in/out, account creation, etc.) and uses query invalidation to ensure that
 * the user data stays current.
 *
 * @param {Object} props - The properties for the AuthProvider.
 * @param {AuthProviderQueryFn} props.authQueryFn - An object containing the query and mutation functions
 *                                                  for authentication operations.
 * @param {React.ReactElement} props.children - The child component(s) that will have access to the authentication context.
 * @returns {JSX.Element} The authentication provider component.
 *
 * @example
 * <AuthProvider authQueryFn={authFunctions}>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({
  authQueryFn,
  children,
}: {
  authQueryFn: AuthProviderQueryFn;
  children: React.ReactElement;
}) {
  // Destructure all authentication-related functions from authQueryFn.
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

  // Initialize the react-query client for query invalidation and refetching.
  const queryClient = useQueryClient();

  /**
   * Invalidate all queries related to the current user.
   *
   * This forces a refetch of user-related queries to ensure the latest data is used.
   */
  const invalidateCurrentUser = () =>
    queryClient.invalidateQueries({ queryKey: ["current-user"], exact: false });

  // Fetch the current user's data using react-query.
  const { data: appUserData } = useQuery({
    queryKey: ["current-user", "data"],
    queryFn: handleGetUserDataQueryFn,
  });

  // Fetch the current user's avatar using react-query.
  // This query is enabled only if user data exists.
  const { data: avatarDataUrl } = useQuery({
    queryKey: ["current-user", "avatar"],
    queryFn: handleGetAvatarMutationFn,
    enabled: !!appUserData,
  });

  // Fallback avatar in case none is provided.
  const avatar = avatarDataUrl ? avatarDataUrl : "/icons/user.svg";

  // Set up mutations for authentication operations using react-query.
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

  // Return the AuthContext provider with the current user data and authentication functions.
  return (
    <AuthContext.Provider
      value={{
        appUserData,
        saveUserData: saveDataMutateAsync,
        saveEmailAndPassword: saveEmailAndPasswordAsync,
        refetchUser: () =>
          queryClient.invalidateQueries(["current-user", "data"]),

        // Login functions
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

        // Avatar functions
        avatar,
        reloadAvatar: () =>
          queryClient.invalidateQueries(["current-user", "avatar"]),
        async uploadAvatar({ file }: { file: File }) {
          await uploadAvatarAsync({ file });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
