import boto3
import json
import os
import subprocess
from pathlib import Path
from dotenv import dotenv_values

# Load environment variables
env_path = Path("../.env")
env_values = dotenv_values(env_path)
app_name = env_values.get("APP_NAME")
stage = env_values.get("STAGE")
region = env_values.get("AWS_REGION")

dynamodb = boto3.client("dynamodb", region_name=region)
s3 = boto3.client("s3", region_name=region)
cloudformation = boto3.client("cloudformation", region_name=region)

# Get CloudFormation outputs
stack_name = f"{app_name}-{stage}-storage-stack"
response = cloudformation.describe_stacks(StackName=stack_name)
outputs = {o["OutputKey"]: o["OutputValue"] for o in response["Stacks"][0].get("Outputs", []) if "OutputValue" in o}
tables = json.loads(outputs.get("tables", '[]'));
buckets = json.loads(outputs.get("buckets", '[]'));

# Set up local DynamoDB and S3 endpoints
dynamodb_local = boto3.client("dynamodb", endpoint_url="http://localhost:8000")
s3_local = boto3.client("s3", endpoint_url="http://localhost:9090")

# Process DynamoDB tables
for table_name in tables:
    table_desc = dynamodb.describe_table(TableName=table_name)["Table"]
    key_schema = table_desc["KeySchema"]
    attribute_definitions = table_desc["AttributeDefinitions"]
    indexes = table_desc.get("GlobalSecondaryIndexes", [])
    
    # Create table on local DynamoDB
    table_params = {
        "TableName": table_name,
        "KeySchema": key_schema,
        "AttributeDefinitions": attribute_definitions,
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    }
    
    if indexes:
        table_params["GlobalSecondaryIndexes"] = [
            {
                "IndexName": idx["IndexName"],
                "KeySchema": idx["KeySchema"],
                "Projection": idx["Projection"],
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            } for idx in indexes
        ]
    
    try:
        dynamodb_local.create_table(**table_params)
        print(f"Created local DynamoDB table: {table_name}")
    except dynamodb_local.exceptions.ResourceInUseException:
        print(f"Table {table_name} already exists locally.")

# Process S3 buckets
for bucket_name in buckets:
    try:
        s3_local.create_bucket(Bucket=bucket_name)
        print(f"Created local S3 bucket: {bucket_name}")
    except s3_local.exceptions.BucketAlreadyOwnedByYou:
        print(f"Bucket {bucket_name} already exists locally.")
