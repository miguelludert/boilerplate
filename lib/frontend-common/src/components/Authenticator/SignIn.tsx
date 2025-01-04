import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form, Input } from "../";
import { FormGroup, Label, Button, Alert } from "reactstrap";
import { createStitches } from "@stitches/react";

const { styled } = createStitches({
  theme: {
    colors: {
      primary: "#007BFF",
      error: "#FF4D4D",
      white: "#FFFFFF",
    },
    space: {
      sm: "0.5rem",
      md: "1rem",
      lg: "2rem",
    },
  },
});

const Container = styled("div", {
  maxWidth: "400px",
  margin: "0 auto",
  padding: "$lg",
});

const Title = styled("h2", {
  textAlign: "center",
  marginBottom: "$lg",
});

const StyledButton = styled(Button, {
  width: "100%",
  padding: "$sm",
  variants: {
    loading: {
      true: {
        backgroundColor: "$primary",
        cursor: "not-allowed",
        opacity: 0.7,
      },
      false: {
        backgroundColor: "$primary",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#0056b3",
        },
      },
    },
  },
});

export interface SignInFormInputs {
  email: string;
  password: string;
}

export interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<void>;
}

export const SignInComponent: React.FC<SignInProps> = ({ onSignIn }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<SignInFormInputs> = async ({
    email,
    password,
  }) => {
    setError(null);
    setLoading(true);

    try {
      await onSignIn(email, password);
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Sign In</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input name="email" />
          {errors.email && <Alert color="danger">{errors.email.message}</Alert>}
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input name="password" />
          {errors.password && (
            <Alert color="danger">{errors.password.message}</Alert>
          )}
        </FormGroup>
        {error && <Alert color="danger">{error}</Alert>}
        <StyledButton type="submit" loading={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </StyledButton>
      </Form>
    </Container>
  );
};
