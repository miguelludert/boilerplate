# Use AWS Lambda Node.js 20 base image
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Install pnpm globally
RUN npm install -g pnpm typescript

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

# Install production dependencies
RUN pnpm install 

# Copy source files and tsconfig.json
COPY index.ts ./
COPY tsconfig.json ./

# Compile TypeScript to JavaScript
RUN tsc

# Set the command to run the Lambda function
CMD [".build/index.handler"]

