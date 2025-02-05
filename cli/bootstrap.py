import os
import subprocess
from pathlib import Path
from dotenv import dotenv_values
import boto3
import argparse

# Parse CLI arguments
parser = argparse.ArgumentParser(description="Setup environment and deploy")
parser.add_argument("--appName", required=True, help="Application name")
parser.add_argument("--region", required=True, help="AWS region")
parser.add_argument("--stage", required=True, help="Deployment stage")
parser.add_argument("--ecr", required=True, help="ECR registry")
args = parser.parse_args()


# Extract values from CLI args
app_name = args.appName
region = args.region
# If stage is 'local', treat it as 'dev' for CDK deploy naming but keep the original for local mode checks
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






# Define paths for the .env and sample files
env_path = Path("../.env")
sample_env_path = Path("../.env.sample")

# Load values from the sample file (or from an existing .env file if it exists)
sample_env_values = dotenv_values(sample_env_path)
if env_path.exists():
    existing_env_values = dotenv_values(env_path)
else:
    existing_env_values = {}

# Prepare dynamic environment updates
is_local = args.stage == "local";
s3_endpoint = "http://localhost:9090" if is_local else ""
dynamo_db_endpoint = "http://localhost:8000" if is_local else ""
api_endpoint = f"http://localhost:{sample_env_values["LOCAL_EXPRESS_PORT"]}" if is_local else frontend_stack_outputs.get("frontendApiUrl", "") 

env_updates = {
    "IS_LOCAL": str(is_local),  # converting boolean to string
    "AWS_REGION": region,
    "COGNITO_USER_POOL_ID": user_stack_outputs.get("userPoolId", ""),
    "COGNITO_CLIENT_ID": user_stack_outputs.get("userPoolClientId", ""),
    "ECR_REGISTRY": ecr_registry,
    "APP_NAME": app_name,
    "STAGE": stage,
    "API_ENDPOINT": api_endpoint,
    "S3_ENDPOINT": s3_endpoint,
    "DYNAMO_DB_ENDPOINT": dynamo_db_endpoint,
}

# Merge sample values with env_updates so that all keys from the sample appear.
# The values in env_updates will override the sample file’s values if they exist.
final_env = {}
final_env.update(sample_env_values)
final_env.update(existing_env_values)
final_env.update(env_updates)

# Write all key/value pairs to the .env file
# Ensure the .env file exists; if not, create it.
env_path.touch(exist_ok=True)
with env_path.open("w") as env_file:
    for key, value in sorted(final_env.items()):
        env_file.write(f"{key}={value}\n")

# Run bootstrap-local.py if stage is 'local'
if args.stage == "local":
    subprocess.run(["python", "bootstrap-local.py"], check=True)
