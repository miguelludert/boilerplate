import { Request, Router } from 'express';

export type AppRequest = Request & {
  user: {
    id: string;
    email: string;
    sub: string;
  };
};

export type EndsWith<Suffix extends string> = `${string}${Suffix}`;
