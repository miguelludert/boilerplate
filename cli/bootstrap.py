import os
import subprocess
from pathlib import Path
from dotenv import dotenv_values, set_key
import boto3
import argparse

# Parse CLI arguments
parser = argparse.ArgumentParser(description="Setup environment and deploy")
parser.add_argument("--appName", required=True, help="Application name")
parser.add_argument("--region", required=True, help="AWS region")
parser.add_argument("--stage", required=True, help="Deployment stage")
parser.add_argument("--ecr", required=True, help="ECR registry")
args = parser.parse_args()

# Load ../.env file
env_path = Path("../.env")
sample_env_path = Path("../.env.sample")
env_values = dotenv_values(env_path) if env_path.exists() else dotenv_values(sample_env_path)

# Extract values
app_name = args.appName
region = args.region
stage = "dev" if args.stage == "local" else args.stage
ecr_registry = args.ecr

# Run CDK deploy
cdk_command = ["cd", "../app/infra/", "&&", "cdk", "deploy", f"{app_name}-{stage}-ecr-stack"]
subprocess.run(" ".join(cdk_command), shell=True, check=True)

# Fetch CloudFormation outputs
cf_client = boto3.client("cloudformation", region_name=region)
stack_name = f"{app_name}-{stage}-user-stack"
frontend_stack = f"{app_name}-{stage}-frontend-stack"

def get_stack_outputs(stack_name):
    response = cf_client.describe_stacks(StackName=stack_name)
    outputs = {output["OutputKey"]: output["OutputValue"] for output in response["Stacks"][0].get("Outputs", [])}
    return outputs

user_stack_outputs = get_stack_outputs(stack_name)
frontend_stack_outputs = get_stack_outputs(frontend_stack)

# Create or update .env file
if not env_path.exists():
    env_path.touch()

s3_endpoint = "http://localhost:9090" if args.stage == "local" else ""
dynamo_db_endpoint = "http://localhost:8000" if args.stage == "local" else ""

env_updates = {
    "IS_LOCAL" : args.stage == "local",
    "AWS_REGION": region,
    "COGNITO_USER_POOL_ID": user_stack_outputs.get("userPoolId", ""),
    "COGNITO_CLIENT_ID": user_stack_outputs.get("userPoolClientId", ""),
    "ECR_REGISTRY": ecr_registry,
    "APP_NAME": app_name,
    "STAGE": stage,
    "API_ENDPOINT": frontend_stack_outputs.get("frontendApiUrl", ""),
    "S3_ENDPOINT": s3_endpoint,
    "DYNAMO_DB_ENDPOINT": dynamo_db_endpoint,
}

with env_path.open("w") as env_file:
    for key, value in sorted(env_updates.items()):
        env_file.write(f"{key}={value}\n")

# Run bootstrap-local.py if stage is 'local'
if args.stage == "local":
    subprocess.run(["python", "bootstrap-local.py"], check=True)
