#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BoilerplateStack } from "./stacks/boilerplate-stack";
import { pascalCase } from "change-case";

const app = new cdk.App();
new BoilerplateStack(app, "CdkStack", {
  namingConvention: (name: string) => pascalCase("boilerplate-dev-" + name),
});
