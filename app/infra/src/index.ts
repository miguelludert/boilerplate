#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BoilerplateStack } from './stacks/boilerplate-stack';
import { join } from 'path';
import('change-case').then(({ kebabCase }) => {
  const app = new cdk.App();
  new BoilerplateStack(app, 'boilerplate-dev', {
    namingConvention: (name: string) => kebabCase('boilerplate-dev-' + name),
    functionsDir: join(__dirname, '../../functions/'),
    expressDir: join(__dirname, '../../express/'),
    frontendDir: join(__dirname, '../../frontend/'),
  });
});
