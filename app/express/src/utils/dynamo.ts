import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  getAwsAccessKeyId,
  getAwsRegion,
  getAwsSecretAccessKey,
  getDynamoDbEndpoint,
} from '../constants';
import { EndsWith } from '../types';

export type DynamoTableName = EndsWith<'-table'>;

export interface DynamoKeyQuery {
  name: string;
  value: string;
  operator?: 'equals' | 'begins_with';
}

export const getDynamoDbClient = () => {
  // Initialize DynamoDB Client
  const dynamoDbClient = new DynamoDBClient({
    endpoint: getDynamoDbEndpoint(),
    credentials: {
      accessKeyId: getAwsAccessKeyId(),
      secretAccessKey: getAwsSecretAccessKey(),
    },
    region: getAwsRegion(),
  });
  return dynamoDbClient;
};

const createQueryExpression = (
  keyQuery: DynamoKeyQuery,
  left: string,
  right: string
) => {
  if (keyQuery.operator === 'begins_with') {
    return `begins_with(${left},${right})`;
  } else {
    return `${left} = ${right}`;
  }
};

// Function to query records by composite partition key
export async function queryByKey<T>(
  tableName: DynamoTableName,
  partitonKeyQuery: DynamoKeyQuery,
  sortKeyQuery?: DynamoKeyQuery,
  indexName?: string
): Promise<T[]> {
  let keyConditionExpression = createQueryExpression(
    partitonKeyQuery,
    '#pk',
    ':pk'
  );

  const expressionAttributeNames: Record<string, string> = {
    '#pk': partitonKeyQuery.name,
  };

  const expressionAttributeValues: Record<string, any> = {
    ':pk': partitonKeyQuery.value,
  };

  if (sortKeyQuery) {
    keyConditionExpression +=
      ' AND ' + createQueryExpression(partitonKeyQuery, '#sk', ':sk');
    expressionAttributeNames['#sk'] = sortKeyQuery.name;
    expressionAttributeValues[':sk'] = sortKeyQuery.value;
  }

  const command = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
  });

  try {
    const response = await getDynamoDbClient().send(command);
    return response.Items
      ? response.Items.map((item) => unmarshall(item) as T)
      : [];
  } catch (error) {
    console.error('Error querying records by composite partition key:', error);
    throw new Error('Failed to query records');
  }
}

export async function putItem(
  tableName: DynamoTableName,
  item: Record<string, any>
): Promise<void> {
  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(item),
  });

  await getDynamoDbClient().send(command);
}

/**
 * Deletes an arbitrarily long batch of items from a DynamoDB table.
 * Handles DynamoDB's limit of 25 items per batch operation.
 *
 * @param tableName - The name of the DynamoDB table
 * @param keys - An array of keys to delete (each key is a record of attribute names and values)
 */
export async function deleteBatchItems(
  tableName: string,
  keys: Array<Record<string, any>>
): Promise<void> {
  if (keys.length === 0) {
    console.log('No items to delete.');
    return;
  }

  const MAX_BATCH_SIZE = 25;
  const batches = [];

  for (let i = 0; i < keys.length; i += MAX_BATCH_SIZE) {
    batches.push(keys.slice(i, i + MAX_BATCH_SIZE));
  }

  // Process each batch
  for (const batch of batches) {
    const requestItems = batch.map((key) => ({
      DeleteRequest: {
        Key: marshall(key),
      },
    }));

    const command = new BatchWriteItemCommand({
      RequestItems: {
        [tableName]: requestItems,
      },
    });
    try {
      const response = await getDynamoDbClient().send(command);
      if (
        response.UnprocessedItems &&
        response.UnprocessedItems[tableName]?.length
      ) {
        console.warn(
          'Unprocessed items found:',
          response.UnprocessedItems[tableName]
        );
      }

      console.log(`Batch of ${batch.length} items deleted successfully.`);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw new Error('Batch deletion failed');
    }
  }

  console.log('All items deleted successfully.');
}

/**
 * Deletes a single item from a DynamoDB table.
 *
 * @param tableName - The name of the DynamoDB table
 * @param partitionKeyName - The name of the partition key
 * @param partitionKeyValue - The value of the partition key
 * @param sortKeyName - (Optional) The name of the sort key
 * @param sortKeyValue - (Optional) The value of the sort key
 */
export async function deleteItem(
  tableName: DynamoTableName,
  partitionKeyQuery: DynamoKeyQuery,
  sortKeyQuery?: DynamoKeyQuery
): Promise<void> {
  try {
    if (partitionKeyQuery.operator) {
      throw 'Function "deleteItem" cannot not use a partition key operator.';
    }

    // Construct the key object
    const key: Record<string, { S: string }> = {
      [partitionKeyQuery.name]: { S: partitionKeyQuery.value },
    };

    if (sortKeyQuery) {
      if (sortKeyQuery.operator) {
        throw 'Function "deleteItem" cannot not use a sort key operator.';
      }
      key[sortKeyQuery.name] = { S: sortKeyQuery.value };
    }

    // Create the delete command
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: key,
    });

    // Send the command to DynamoDB
    await getDynamoDbClient().send(command);
    console.log(
      `Item with key (${partitionKeyQuery.name}: ${partitionKeyQuery.value}${sortKeyQuery ? `, ${sortKeyQuery?.name}: ${sortKeyQuery.value}` : ''}) deleted successfully.`
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
}

export interface DynamoPatchInput {}

export const patchItem = async (
  tableName: DynamoTableName,
  key: Record<string, any>,
  updateData: Record<string, any>
): Promise<void> => {
  const dynamoDbClient = getDynamoDbClient();

  try {
    // Construct the UpdateExpression and ExpressionAttributeValues
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    for (const [field, value] of Object.entries(updateData)) {
      const attributeName = `#${field}`;
      const attributeValue = `:${field}`;
      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeValues[attributeValue] = value;
      expressionAttributeNames[attributeName] = field;
    }

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    // Execute the UpdateItemCommand
    await dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: tableName,
        Key: marshall(key),
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        ExpressionAttributeNames: expressionAttributeNames,
      })
    );

    console.log('Record patched successfully');
  } catch (error) {
    console.error('Error patching record in DynamoDB:', error);
    throw new Error('Failed to patch record in DynamoDB');
  }
};
