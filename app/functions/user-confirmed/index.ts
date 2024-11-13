import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PostConfirmationTriggerEvent, Context } from 'aws-lambda';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoDbClient = new DynamoDBClient({});

export const handler = async (
  event: PostConfirmationTriggerEvent,
  context: Context
): Promise<PostConfirmationTriggerEvent> => {
  const userSub = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const params = {
    TableName: process.env.USERS_TABLE_NAME!,
    Item: marshall({
      id: userSub,
      email: email,
      createdAt: new Date().toISOString(),
    }),
  };
  try {
    await dynamoDbClient.send(new PutItemCommand(params));
    console.log(`User with cognito_id ${userSub} added to DynamoDB.`);
    return event;
  } catch (error) {
    console.error('Error inserting user into DynamoDB:', error);
    throw new Error('Error inserting user in the database');
  }
};
