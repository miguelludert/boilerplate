import "./index.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Authenticator, AuthProvider } from "@miguelludert/frontend-common";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { authQueryFn } from "./queries/auth";
import { Amplify, ResourcesConfig } from "aws-amplify";

const router = createHashRouter(routes);

const queryClient = new QueryClient();

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authQueryFn={authQueryFn}>
        <Authenticator>
          <RouterProvider router={router}></RouterProvider>
        </Authenticator>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
