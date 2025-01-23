import "./index.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider, Authenticator } from "@miguelludert/frontend-common";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { authQueryFn } from "./queries/auth";

const router = createBrowserRouter(routes);

const queryClient = new QueryClient();

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
