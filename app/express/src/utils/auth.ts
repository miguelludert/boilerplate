import express, { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getAwsRegion, getCognitoUserPoolId } from '../constants';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${getAwsRegion()}.amazonaws.com/${getCognitoUserPoolId()}/.well-known/jwks.json`, // Replace with your region and User Pool ID
});

function getKey(
  header: any,
  callback: (err: Error | null, key?: string) => void
) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}
export function validateJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${getAwsRegion()}.amazonaws.com/${getCognitoUserPoolId()}`, // Replace with your region and User Pool ID
    },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
      (req as any).user = decoded as JwtPayload; // Store user information in the request object
      next();
    }
  );
}
