# Use the base image built from lambda-base
ARG LAMBDA_BASE
FROM ${LAMBDA_BASE} AS builder

WORKDIR /workdir/app/functions/user-confirmed

#First thing I want to do is copy the current application from my host machine into the appropriate workdir
COPY ./src ./src
COPY package.json .
COPY tsconfig.json .

# Build the project using Vite
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# # Set the working directory to the app's path within the base image
# WORKDIR /workdir/app/express

# Final stage for the production image
FROM public.ecr.aws/lambda/nodejs:20

# Set the Lambda working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the built files from the builder stage
COPY --from=builder /workdir/app/functions/user-confirmed/.build ./

# Set the command to run the Lambda function
CMD [".build/index.handler"]

