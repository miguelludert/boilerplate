import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Directories, NamingConventionProps } from '../types';
import {
  BucketDeployment,
  Source as S3DeploySource,
} from 'aws-cdk-lib/aws-s3-deployment';
import { join } from 'path';
import { existsSync } from 'fs';
import { UserStack } from './user-stack';

export type BoilerplateStackProps = cdk.StackProps &
  NamingConventionProps &
  Directories;

export class BoilerplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BoilerplateStackProps) {
    super(scope, id, props);

    const { namingConvention } = props;

    const userStack = new UserStack(
      this,
      namingConvention('user-stack'),
      props
    );

    const bucket = new s3.Bucket(this, namingConvention('site-bucket'), {
      bucketName: namingConvention('site-bucket'),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });
    const frontendBuildPath = join(__dirname, '../../../frontend/dist');
    const frontendSourceDirectory = existsSync(frontendBuildPath)
      ? frontendBuildPath
      : join(__dirname, '../../empty-bucket-contents');
    const uploadSource = S3DeploySource.asset(frontendSourceDirectory);
    const deployment = new BucketDeployment(
      this,
      namingConvention('deployment'),
      {
        sources: [uploadSource],
        destinationBucket: bucket,
      }
    );
    const mediaBucket = new s3.Bucket(this, namingConvention('media-bucket'), {
      bucketName: namingConvention('media-bucket'),
    });
    const mediaTable = new dynamodb.Table(
      this,
      namingConvention('media-table'),
      {
        tableName: namingConvention('media-table'),
        partitionKey: {
          name: 'table#tableId#usage',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const lambdaFunctionRootDir = join(__dirname, '../../../express/');
    console.info(lambdaFunctionRootDir);
    const lambdaFunction = new lambda.DockerImageFunction(
      this,
      namingConvention('express-function'),
      {
        functionName: namingConvention('express-function'),
        code: lambda.DockerImageCode.fromImageAsset(lambdaFunctionRootDir, {
          file: 'Dockerfile',
          assetName: namingConvention('express-function'),
        }),
        environment: {
          COGNITO_USER_POOL_ID: userStack.getUserPoolId(),
          COGNITO_CLIENT_ID: userStack.getUserPoolClientId(),
          // COGNITO_CLIENT_SECRET:
          // USER_POOL_CLIENT_SECRET:
          //   userPoolClient.userPoolClientSecret.unsafeUnwrap(),
        },
      }
    );
    const lambdaFunctionUrl = lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // function grants
    mediaBucket.grantReadWrite(lambdaFunction);
    mediaTable.grantReadWriteData(lambdaFunction);

    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      namingConvention('distribution-oac'),
      {
        signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
      }
    );
    const distribution = new cloudfront.Distribution(
      this,
      namingConvention('distribution'),
      {
        defaultBehavior: {
          origin: new cloudfrontOrigins.S3StaticWebsiteOrigin(bucket),
        },
        additionalBehaviors: {
          api: {
            origin: new cloudfrontOrigins.HttpOrigin(
              this.getURLDomain(lambdaFunctionUrl)
            ),
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          },
        },
      }
    );

    new cdk.CfnOutput(this, namingConvention('bucketWebsiteUrl'), {
      value: bucket.bucketWebsiteUrl,
    });
    new cdk.CfnOutput(this, namingConvention('distributionDomainName'), {
      value: distribution.domainName,
    });
    new cdk.CfnOutput(this, namingConvention('lambdaFunctionUrl'), {
      value: lambdaFunctionUrl.url,
    });
    new cdk.CfnOutput(this, namingConvention('userPoolId'), {
      value: userStack.getUserPoolId(),
    });
    new cdk.CfnOutput(this, namingConvention('userPoolClientId'), {
      value: userStack.getUserPoolClientId(),
    });
  }

  getURLDomain(lambdaUrl: lambda.FunctionUrl) {
    return cdk.Fn.select(2, cdk.Fn.split('/', lambdaUrl.url));
  }
}
