import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Stack, RemovalPolicy, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { createFunction } from "../utils/create-function";
import { NamingConventionProps } from "../types";

export type UserStackProps = StackProps & NamingConventionProps;

export class UserStack extends Stack {
  userPoolId: string;
  userPoolClientId: string;

  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, props);
    const { namingConvention } = props;

    const usersTable = dynamodb.Table.fromTableName(
      this,
      namingConvention("users-table"),
      namingConvention("users-table")
    );
    const { func: postConfirmationFunction } = createFunction(
      this,
      namingConvention("user-confirmed"),
      {
        environment: {
          USERS_TABLE_NAME: usersTable.tableName,
        },
      }
    );

    usersTable.grantWriteData(postConfirmationFunction);

    const userPool = new cognito.UserPool(this, namingConvention("user-pool"), {
      userPoolName: namingConvention("user-pool"),
      signInAliases: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      lambdaTriggers: {
        postConfirmation: postConfirmationFunction,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      namingConvention("user-pool-client"),
      {
        userPoolClientName: namingConvention("user-pool-client"),
        userPool,
        generateSecret: false,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
        },
      }
    );

    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;
  }
}
