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

export interface CreateAccountFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateAccountProps {
  onCreateAccount: (email: string, password: string) => Promise<void>;
}

export const CreateAccountComponent: React.FC<CreateAccountProps> = ({
  onCreateAccount,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAccountFormInputs>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<CreateAccountFormInputs> = async ({
    email,
    password,
  }) => {
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await onCreateAccount(email, password);
      setMessage(
        'Account created successfully! Please check your email to verify your account.'
      );
    } catch (err) {
      setError((err as Error).message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Create Account</Title>
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
        <FormGroup>
          <Label for='password'>Password</Label>
          <Input
            id='password'
            type='password'
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            })}
            invalid={!!errors.password}
          />
          {errors.password && (
            <Alert color='danger'>{errors.password.message}</Alert>
          )}
        </FormGroup>
        <FormGroup>
          <Label for='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            type='password'
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === watch('password') || 'Passwords do not match',
            })}
            invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <Alert color='danger'>{errors.confirmPassword.message}</Alert>
          )}
        </FormGroup>
        {message && <Alert color='success'>{message}</Alert>}
        {error && <Alert color='danger'>{error}</Alert>}
        <StyledButton type='submit' loading={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </StyledButton>
      </Form>
    </Container>
  );
};
