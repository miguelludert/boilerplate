import { Layout, useCurrentUser } from "@miguelludert/frontend-common";
import { Authenticator } from "@miguelludert/frontend-common";
import { authQueryFn } from "../renderer/queries/auth";
export const Home = () => {
  const { appUser } = useCurrentUser();
  return (
    <Layout>
      <Authenticator
        appUser={appUser}
        authQueryFn={authQueryFn}
      ></Authenticator>
    </Layout>
  );
};
