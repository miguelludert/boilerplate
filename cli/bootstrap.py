#!/usr/bin/env python3
import boto3
import json
from botocore.exceptions import ClientError
import os
import datetime
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# List of required environment variables
required_env_vars = ["APP_NAME", "STAGE", "DYNAMO_DB_ENDPOINT", "S3_ENDPOINT", "REGION"]
missing = [var for var in required_env_vars if not os.getenv(var)]
if missing:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")

# Retrieve configuration values (they are now guaranteed to be present)
APP_NAME = os.getenv("APP_NAME")
STAGE = os.getenv("STAGE")
DYNAMO_DB_ENDPOINT = os.getenv("DYNAMO_DB_ENDPOINT")
S3_ENDPOINT = os.getenv("S3_ENDPOINT")
REGION = os.getenv("REGION")


def create_dynamo_table(
    dynamodb,
    table_name: str,
    key_schema: list,
    attribute_definitions: list,
    global_secondary_indexes: list = None,
):
    """
    Creates a DynamoDB table using the provided parameters.
    If the table already exists, it skips creation.
    """
    params = {
        "TableName": table_name,
        "KeySchema": key_schema,
        "AttributeDefinitions": attribute_definitions,
        "BillingMode": "PAY_PER_REQUEST",
    }
    if global_secondary_indexes:
        params["GlobalSecondaryIndexes"] = global_secondary_indexes

    try:
        print(f"Creating DynamoDB table: {table_name}")
        dynamodb.create_table(**params)
        # Wait until the table exists.
        dynamodb.get_waiter("table_exists").wait(TableName=table_name)
        print(f"Created table: {table_name}")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"Table {table_name} already exists, skipping creation.")
        else:
            raise


def create_s3_bucket(s3, bucket_name: str):
    """
    Creates an S3 bucket.
    If the bucket already exists, it skips creation.
    """
    try:
        print(f"Creating S3 bucket: {bucket_name}")
        s3.create_bucket(Bucket=bucket_name)
        print(f"Created bucket: {bucket_name}")
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        if error_code in ["BucketAlreadyOwnedByYou", "BucketAlreadyExists"]:
            print(f"Bucket {bucket_name} already exists, skipping creation.")
        else:
            raise


def create_dynamodb_tables():
    """
    Creates the DynamoDB tables: '{APP_NAME}-{STAGE}-users-table' and '{APP_NAME}-{STAGE}-media-table'.
    The media table includes a global secondary index.
    """
    dynamodb = boto3.client("dynamodb", endpoint_url=DYNAMO_DB_ENDPOINT, region_name=REGION)

    # Create the users table with partition key "userId"
    users_table_name = f"{APP_NAME}-{STAGE}-users-table"
    create_dynamo_table(
        dynamodb,
        table_name=users_table_name,
        key_schema=[{"AttributeName": "userId", "KeyType": "HASH"}],
        attribute_definitions=[{"AttributeName": "userId", "AttributeType": "S"}],
    )

    # Create the media table with partition key "mediaId" and a GSI "bySource"
    media_table_name = f"{APP_NAME}-{STAGE}-media-table"
    create_dynamo_table(
        dynamodb,
        table_name=media_table_name,
        key_schema=[{"AttributeName": "mediaId", "KeyType": "HASH"}],
        attribute_definitions=[
            {"AttributeName": "mediaId", "AttributeType": "S"},
            {"AttributeName": "sourceName#sourceId#usage", "AttributeType": "S"},
        ],
        global_secondary_indexes=[
            {
                "IndexName": "bySource",
                "KeySchema": [
                    {"AttributeName": "sourceName#sourceId#usage", "KeyType": "HASH"},
                    {"AttributeName": "mediaId", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
    )


def create_bootstrap_user():
    """
    Inserts a bootstrap user into the 'users-table' if it doesn't already exist.
    The user will have a userId of 'local-user' and dummy values for name and email.
    """
    dynamodb = boto3.client("dynamodb", endpoint_url=DYNAMO_DB_ENDPOINT, region_name=REGION)
    users_table_name = f"{APP_NAME}-{STAGE}-users-table"
    
    try:
        # Check if the bootstrap user already exists.
        response = dynamodb.get_item(
            TableName=users_table_name,
            Key={"userId": {"S": "local-user"}}
        )
        if "Item" in response:
            print("Bootstrap user already exists. Skipping creation.")
            return

        print("Creating bootstrap user in the users table...")
        dynamodb.put_item(
            TableName=users_table_name,
            Item={
                "userId": {"S": "local-user"},
                "firstName": {"S": "Hello"},
                "lastName": {"S": "World"},
                "email": {"S": "hello@world.com"},
                "createdAt": {"S": datetime.datetime.utcnow().isoformat() + "Z"},
            }
        )
        print("Bootstrap user created.")
    except ClientError as e:
        print("Error creating bootstrap user:", e)


def create_s3_buckets():
    """
    Creates the '{APP_NAME}-{STAGE}-media-bucket' in S3.
    """
    s3 = boto3.client("s3", endpoint_url=S3_ENDPOINT, region_name=REGION)
    bucket_name = f"{APP_NAME}-{STAGE}-media-bucket"
    create_s3_bucket(s3, bucket_name=bucket_name)


def main():
    print("Starting local resource creation...")
    create_dynamodb_tables()
    create_bootstrap_user()
    create_s3_buckets()


if __name__ == "__main__":
    main()
