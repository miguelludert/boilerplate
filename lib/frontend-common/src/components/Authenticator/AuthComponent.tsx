import React, { useState } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import { createStitches } from "@stitches/react";
import { SignInComponent } from "./SignIn";
import { CreateAccountComponent } from "./CreateAccount";
import { ForgotPasswordComponent } from "./ForgotPassword";

const { styled } = createStitches({
  theme: {
    colors: {
      primary: "#007BFF",
      gray: "#6c757d",
    },
    space: {
      md: "1rem",
      lg: "2rem",
    },
  },
});

const Container = styled("div", {
  maxWidth: "500px",
  margin: "0 auto",
  padding: "$lg",
});

const Title = styled("h1", {
  textAlign: "center",
  marginBottom: "$lg",
});

const Link = styled("span", {
  color: "$primary",
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
});

export interface AuthComponentProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onCreateAccount: (email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
}

export const AuthComponent: React.FC<AuthComponentProps> = ({
  onSignIn,
  onCreateAccount,
  onForgotPassword,
}) => {
  const [activeTab, setActiveTab] = useState("signIn");
  const [forgotPassword, setForgotPassword] = useState(false);

  const toggleTab = (tab: string) => {
    setForgotPassword(false);
    setActiveTab(tab);
  };

  return (
    <Container>
      {!forgotPassword ? (
        <>
          <Nav tabs>
            <NavItem>
              <NavLink
                active={activeTab === "signIn"}
                onClick={() => toggleTab("signIn")}
                style={{ cursor: "pointer" }}
              >
                Sign In
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "createAccount"}
                onClick={() => toggleTab("createAccount")}
                style={{ cursor: "pointer" }}
              >
                Create Account
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="signIn">
              <SignInComponent onSignIn={onSignIn} />
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Link onClick={() => setForgotPassword(true)}>
                  Forgot Password?
                </Link>
              </div>
            </TabPane>
            <TabPane tabId="createAccount">
              <CreateAccountComponent onCreateAccount={onCreateAccount} />
            </TabPane>
          </TabContent>
        </>
      ) : (
        <>
          <Link onClick={() => toggleTab("signIn")}>&lt; Back to Sign In</Link>
          <ForgotPasswordComponent onForgotPassword={onForgotPassword} />
        </>
      )}
    </Container>
  );
};
