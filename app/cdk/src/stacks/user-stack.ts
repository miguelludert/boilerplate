import { Construct } from 'constructs';
import { BoilerplateStackProps } from './boilerplate-stack';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CfnOutput, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';

export class UserStack extends NestedStack {
  private _usersTable: dynamodb.Table;
  private _userPoolId: string;
  private _userPoolClientId: string;

  constructor(scope: Construct, id: string, props: BoilerplateStackProps) {
    super(scope, id, props);
    const { namingConvention } = props;

    this._usersTable = new dynamodb.Table(
      this,
      namingConvention('users-table'),
      {
        tableName: namingConvention('users-table'),
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    const postConfirmationFunction = new lambda.DockerImageFunction(
      this,
      namingConvention('user-confirmed-function'),
      {
        functionName: namingConvention('user-confirmed-function'),
        code: lambda.DockerImageCode.fromImageAsset(
          join(props.functionsDir, 'user-confirmed'),
          {
            file: 'Dockerfile',
            assetName: namingConvention('user-confirmed'),
          }
        ),
        environment: {
          USERS_TABLE_NAME: this._usersTable.tableName,
        },
      }
    );

    this._usersTable.grantWriteData(postConfirmationFunction);

    const userPool = new cognito.UserPool(this, namingConvention('user-pool'), {
      userPoolName: namingConvention('user-pool'),
      signInAliases: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      lambdaTriggers: {
        postConfirmation: postConfirmationFunction,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      namingConvention('user-pool-client'),
      {
        userPoolClientName: namingConvention('user-pool-client'),
        userPool,
        generateSecret: false,
      }
    );

    this._userPoolId = userPool.userPoolId;
    this._userPoolClientId = userPoolClient.userPoolClientId;
  }

  grantTableAccess(func: lambda.Function) {
    this._usersTable.grantFullAccess(func);
  }

  getUserPoolId() {
    return this._userPoolId;
  }

  getUserPoolClientId() {
    return this._userPoolClientId;
  }
}
