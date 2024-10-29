import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NamingConventionProps } from "../types";
import {
  BucketDeployment,
  Source as S3DeploySource,
} from "aws-cdk-lib/aws-s3-deployment";
import { join } from "path";

export type BoilerplateStackProps = cdk.StackProps & NamingConventionProps;

export class BoilerplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BoilerplateStackProps) {
    super(scope, id, props);

    const { namingConvention } = props;

    const userPool = new cognito.UserPool(this, namingConvention("user-pool"), {
      signInAliases: { email: true },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      namingConvention("user-pool-client"),
      {
        userPool,
        generateSecret: true,
      }
    );

    const bucket = new s3.Bucket(this, namingConvention("site-bucket"), {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    const uploadSource = S3DeploySource.asset(
      join(__dirname, "../emtpty-bucket-contents")
    );
    const deployment = new BucketDeployment(
      this,
      namingConvention("deployment"),
      {
        sources: [uploadSource],
        destinationBucket: bucket,
      }
    );

    const lambdaFunction = new lambda.Function(this, "express-function", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Hello from Lambda!" })
          };
        };
      `),
      environment: {
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        USER_POOL_CLIENT_SECRET: userPoolClient.userPoolClientSecret.toString(),
      },
    });

    const usersTable = new dynamodb.Table(
      this,
      namingConvention("users-table"),
      {
        partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      }
    );
    usersTable.grantReadWriteData(lambdaFunction);

    const httpApi = new apigatewayv2.HttpApi(
      this,
      namingConvention("http-api")
    );
    const lambdaIntegration =
      new apigatewayv2Integrations.HttpLambdaIntegration(
        "LambdaIntegration",
        lambdaFunction
      );
    httpApi.addRoutes({
      path: "/{proxy+}",
      integration: lambdaIntegration,
    });

    const distribution = new cloudfront.Distribution(
      this,
      namingConvention("distribution"),
      {
        defaultBehavior: { origin: new cloudfrontOrigins.S3Origin(bucket) },
        additionalBehaviors: {
          api: {
            origin: new cloudfrontOrigins.HttpOrigin(httpApi.apiEndpoint),
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          },
        },
      }
    );

    new cdk.CfnOutput(this, namingConvention("distributionDomainName"), {
      value: distribution.domainName,
    });
    new cdk.CfnOutput(this, namingConvention("userPoolClientId"), {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, namingConvention("userPoolClientSecret"), {
      value: userPoolClient.userPoolClientSecret.toString(),
    });
  }
}
