import { Card, styled } from '@mui/material'
import { Input } from '../../../../../../lib/frontend-common/src/components/Input'
import { Button } from '../../../../../../lib/frontend-common/src/components/Button'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'your-region' // e.g., 'us-east-1'
})

type LoginFormInputs = {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>()
  const [error, setError] = useState('')

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: 'your-client-id', // replace with your Cognito App Client ID
        AuthParameters: {
          USERNAME: data.username,
          PASSWORD: data.password
        }
      })

      const response = await cognitoClient.send(command)

      if (response.AuthenticationResult) {
        alert('Logged in successfully')
        console.log('Access Token:', response.AuthenticationResult.AccessToken)
        // Redirect or store token as needed
      } else {
        setError('Failed to authenticate')
      }
    } catch (err: any) {
      setError(err.message || 'Error logging in')
    }
  }

  return (
    <Card variant="outlined">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>
            Username:
            <Input type="text" {...register('username', { required: 'Username is required' })} />
          </label>
          {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
        </div>
        <div>
          <label>
            Password:
            <Input
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
          </label>
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button type="submit">Log In</Button>
      </form>
    </Card>
  )
}

export { LoginPage }
