import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Directories, NamingConventionProps } from "../types";
import {
  BucketDeployment,
  Source as S3DeploySource,
} from "aws-cdk-lib/aws-s3-deployment";
import { join } from "path";
import { existsSync } from "fs";
import { UserStack } from "./user-stack";

export type FrontendStackProps = cdk.StackProps &
  NamingConventionProps &
  Directories & {
    expressFunction: lambda.Function;
  };

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { namingConvention, expressFunction } = props;
    const expressFunctionUrl = expressFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    const frontendBucket = s3.Bucket.fromBucketName(
      this,
      namingConvention("frontend-bucket"),
      namingConvention("frontend-bucket")
    );
    const frontendBuildPath = join(__dirname, "../../../frontend/dist");
    const frontendSourceDirectory = existsSync(frontendBuildPath)
      ? frontendBuildPath
      : join(__dirname, "../../empty-bucket-contents");
    const uploadSource = S3DeploySource.asset(frontendSourceDirectory);
    const deployment = new BucketDeployment(
      this,
      namingConvention("deployment"),
      {
        sources: [uploadSource],
        destinationBucket: frontendBucket,
      }
    );

    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      namingConvention("distribution-oac"),
      {
        signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
      }
    );
    const distribution = new cloudfront.Distribution(
      this,
      namingConvention("distribution"),
      {
        defaultBehavior: {
          origin: new cloudfrontOrigins.S3StaticWebsiteOrigin(frontendBucket),
        },
        additionalBehaviors: {
          api: {
            origin: new cloudfrontOrigins.HttpOrigin(
              this.getURLDomain(expressFunctionUrl)
            ),
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          },
        },
      }
    );

    new cdk.CfnOutput(this, namingConvention("output-bucketWebsiteUrl"), {
      value: frontendBucket.bucketWebsiteUrl,
    });
    new cdk.CfnOutput(this, namingConvention("output-distributionDomainName"), {
      value: distribution.domainName,
    });
  }

  getURLDomain(lambdaUrl: lambda.FunctionUrl) {
    return cdk.Fn.select(2, cdk.Fn.split("/", lambdaUrl.url));
  }
}
