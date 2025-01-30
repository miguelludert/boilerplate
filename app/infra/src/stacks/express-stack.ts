import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Function } from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NamingConventionProps } from "../types";
import { createFunction } from "../utils/create-function";

export type ExpressStackProps = cdk.StackProps &
  NamingConventionProps & {
    userPoolId: string;
    userPoolClientId: string;
    tables: Record<string, dynamodb.Table>;
    buckets: Record<string, s3.Bucket>;
  };

export class ExpressStack extends cdk.Stack {
  expressFunction: Function;

  constructor(scope: Construct, id: string, props: ExpressStackProps) {
    super(scope, id, props);

    const { namingConvention, userPoolId, userPoolClientId, tables, buckets } =
      props;

    const { func: expressFunction } = createFunction(
      this,
      namingConvention("express"),
      {
        environment: {
          COGNITO_USER_POOL_ID: userPoolId,
          COGNITO_CLIENT_ID: userPoolClientId,
        },
      }
    );
    this.expressFunction = expressFunction;

    Object.values(tables).forEach((table) => {
      table.grantReadWriteData(expressFunction);
    });
    buckets["media-bucket"].grantReadWrite(expressFunction);
  }
}
