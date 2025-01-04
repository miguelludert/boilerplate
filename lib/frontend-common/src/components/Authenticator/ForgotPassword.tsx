import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form } from '../Form';
import { FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { createStitches } from '@stitches/react';

const { styled } = createStitches({
  theme: {
    colors: {
      primary: '#007BFF',
      error: '#FF4D4D',
      white: '#FFFFFF',
    },
    space: {
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
    },
  },
});

const Container = styled('div', {
  maxWidth: '400px',
  margin: '0 auto',
  padding: '$lg',
});

const Title = styled('h2', {
  textAlign: 'center',
  marginBottom: '$lg',
});

const StyledButton = styled(Button, {
  width: '100%',
  padding: '$sm',
  variants: {
    loading: {
      true: {
        backgroundColor: '$primary',
        cursor: 'not-allowed',
        opacity: 0.7,
      },
      false: {
        backgroundColor: '$primary',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#0056b3',
        },
      },
    },
  },
});

export interface ForgotPasswordFormInputs {
  email: string;
}

export interface ForgotPasswordProps {
  onForgotPassword: (email: string) => Promise<void>;
}

export const ForgotPasswordComponent: React.FC<ForgotPasswordProps> = ({
  onForgotPassword,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async ({
    email,
  }) => {
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await onForgotPassword(email);
      setMessage('If this email exists, a password reset link has been sent.');
    } catch (err) {
      setError((err as Error).message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Forgot Password</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label for='email'>Email</Label>
          <Input
            id='email'
            type='email'
            {...register('email', { required: 'Email is required' })}
            invalid={!!errors.email}
          />
          {errors.email && <Alert color='danger'>{errors.email.message}</Alert>}
        </FormGroup>
        {message && <Alert color='success'>{message}</Alert>}
        {error && <Alert color='danger'>{error}</Alert>}
        <StyledButton type='submit' loading={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </StyledButton>
      </Form>
    </Container>
  );
};
