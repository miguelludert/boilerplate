#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { join } from "path";
import { EcrRepositoriesStack } from "./stacks/ecr-stack";
import { StorageStack } from "./stacks/storage-stack";
import { UserStack } from "./stacks/user-stack";
import { ExpressStack } from "./stacks/express-stack";
import { FrontendStack } from "./stacks/frontend-stack";
import { loadLatestImageShas } from "./utils/get-image-sha";

import("change-case").then(async ({ kebabCase }) => {
  const { AWS_REGION: region } = process.env;
  const stage = process.env.STAGE || "dev";
  const baseStackName = `ta2025-${stage}`;
  const namingConvention = (name: string) =>
    kebabCase(`${baseStackName}-${name}`);
  const baseProps = {
    namingConvention,
  };

  await loadLatestImageShas(
    [
      namingConvention("lambda-base"),
      namingConvention("express"),
      namingConvention("user-confirmed"),
    ],
    region!
  );

  const app = new cdk.App();
  const ecrStack = new EcrRepositoriesStack(
    app,
    namingConvention("ecr-stack"),
    baseProps
  );
  const { tables, buckets } = new StorageStack(
    app,
    namingConvention("storage-stack"),
    baseProps
  );
  const { userPoolClientId, userPoolId } = new UserStack(
    app,
    namingConvention("user-stack"),
    baseProps
  );
  const { expressFunction } = new ExpressStack(
    app,
    namingConvention("express-stack"),
    {
      ...baseProps,
      userPoolClientId,
      userPoolId,
      tables,
      buckets,
    }
  );
  const frontendStack = new FrontendStack(
    app,
    namingConvention("frontend-stack"),
    {
      ...baseProps,
      expressFunction,
      frontendDir: join(__dirname, "../../frontend/"),
    }
  );
});
