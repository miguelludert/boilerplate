/**
 * This file provides application-level configuration and global shared variables.
 * It is designed to store non-user-related data such as application routes, configurations,
 * and environment variables. This centralization ensures that configuration data remains
 * in one place and is easily accessible across the application.
 *
 * The AppProvider component accepts an array of `RouteObject` (from `react-router-dom`)
 * which may include additional metadata, and it exposes that configuration through the
 * `useApp` hook.
 *
 * @module AppContext
 */

import React, { createContext, useContext, ReactNode } from "react";
import { RouteObject } from "react-router-dom";
import { AppRoute } from "@miguelludert/types-common";

/**
 * Interface representing the application context.
 *
 * This context provides access to global settings, including:
 * - `routes`: The array of route definitions for the application.
 *
 * Additional configuration fields (such as environment variables) can be added here.
 */
export interface AppContextValue {
  routes: AppRoute[];
  // You can add more global configurations here, e.g.:
  // envVariables: Record<string, string>;
}

/**
 * Create the AppContext using React's Context API.
 *
 * The default value is set to `undefined` to enforce that the context is
 * only used within an appropriate provider.
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Props for the AppProvider component.
 *
 * @property {AppRoute[]} routes - The array of route definitions for the application.
 * @property {ReactNode} children - The child components that will have access to this context.
 */
export interface AppProviderProps {
  routes: RouteObject[];
  children: ReactNode;
}

/**
 * AppProvider Component
 *
 * Wraps your application to provide access to application-level configurations.
 * This is the single source of truth for global settings, such as routes and environment
 * variables.
 *
 * @param {AppProviderProps} props - The properties for the provider.
 * @returns {JSX.Element} The provider component that supplies the application context to its children.
 *
 * @example
 * // Wrap your application at the root level:
 * import { routes } from "./routes";
 *
 * <AppProvider routes={routes}>
 *   <YourAppComponents />
 * </AppProvider>
 */
export const AppProvider: React.FC<AppProviderProps> = ({
  routes,
  children,
}) => {
  return (
    <AppContext.Provider value={{ routes }}>{children}</AppContext.Provider>
  );
};

/**
 * Custom hook to access application-level configurations.
 *
 * This hook returns the context value containing the application routes and any other
 * global settings you might add.
 *
 * @returns {AppContextValue} The application context containing global configurations.
 *
 * @throws Will throw an error if used outside of an AppProvider.
 *
 * @example
 * const { routes } = useApp();
 */
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
