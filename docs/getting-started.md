# Getting Started

Follow these steps to get up and running with the ML Express Boilerplate:

## Setup

### 1. Clone the Repository

This repository is a template repository, so ensure you provide a custom name for your folder:

```bash
git clone https://github.com/miguelludert/ml-express-boilerplate <custom-folder-name>
```

### 2. Navigate to the Project Directory

Move into your project directory:

```bash
cd <custom-folder-name>
```

### 3. Install Dependencies

Use `pnpm` to install the necessary dependencies:

```bash
pnpm install
```

### 5. Deploy the Application

Run the following command to deploy the application:

```bash
pnpm deploy
```

### 6. Create Environment Variables

After deployment, copy `.env.sample` and remove the `.sample` extension to create the `.env` file.  The 
file comes with standard defaults for most variables.  From the cdk output copy env variables
 into your `.env` file:

```
COGNITO_USER_POOL_ID=<value-from-deploy-output>
COGNITO_CLIENT_ID=<value-from-deploy-output>
MEDIA_BUCKET_NAME=<value-from-deploy-output>
MEDIA_TABLE_NAME=<value-from-deploy-output>
```

These variables are dynamically generated during deployment and required for the application to run.

### 7. Start the Development Server

Run the development server:

```bash
pnpm start
```

All applications should begin to execute on their designated ports, including the browser frontend and electron apps.

---

## Environment Variables

To configure the application, create a `.env` file in the root directory of your project. Below is a table describing each environment variable:

| Variable               | Description                                                                      | Type    |
| ---------------------- | -------------------------------------------------------------------------------- | ------- |
| `AWS_ACCESS_ID`        | The AWS access key ID for authentication.                                        | String  |
| `AWS_ACCESS_SECRET`    | The AWS secret access key for authentication.                                    | String  |
| `AWS_REGION`           | The AWS region where services are hosted.                                        | String  |
| `FRONTEND_PORT`        | The port number for the frontend server.                                         | Integer |
| `EXPRESS_PORT`         | The port number for the Express.js backend server.                               | Integer |
| `HOSTNAME`             | The hostname for the application.                                                | String  |
| `API_ENDPOINT`         | The URL endpoint for the API.                                                    | String  |
| `S3_ENDPOINT`          | The endpoint URL for the S3-compatible storage service.                          | String  |
| `DYNAMO_DB_ENDPOINT`   | The endpoint URL for the DynamoDB instance.                                      | String  |
| `MEDIA_SIZE_MB_LIMIT`  | The maximum allowed size for uploaded media files, in megabytes.                 | Integer |
| `COGNITO_USER_POOL_ID` | The Cognito User Pool ID, generated during deployment.                           | String  |
| `COGNITO_CLIENT_ID`    | The Cognito app client ID, generated during deployment.                          | String  |
| `MEDIA_BUCKET_NAME`    | The name of the S3 bucket for storing media files, generated during deployment.  | String  |
| `MEDIA_TABLE_NAME`     | The DynamoDB table name for storing media metadata, generated during deployment. | String  |
| `USERS_TABLE_NAME`     | The DynamoDB table name for storing user data.                                   | String  |

Replace the placeholders with appropriate values depending on your application's configuration.

---

**Note:** For now, the application must be developed with an active internet connection until Cognito is mocked. However, we strive to rely on local resources as much as possible to minimize external dependencies.

