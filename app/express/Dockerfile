# Use the base image built from lambda-base
ARG LAMBDA_BASE
FROM ${LAMBDA_BASE} AS builder

WORKDIR /workdir/app/express

#First thing I want to do is copy the current application from my host machine into the appropriate workdir
COPY ./src ./src
COPY package.json .
COPY tsconfig.json .

# Build the project using Vite
RUN pnpm install -p --frozen-lockfile
RUN pnpm --filter=@miguelludert/express deploy .deploy --prod
RUN pnpm run build

COPY package.json ./.build/
RUN rsync -a .deploy/node_modules .build/

# Final stage for the production image
FROM public.ecr.aws/lambda/nodejs:20

# Set the Lambda working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy the built files from the builder stage
COPY --from=builder /workdir/app/express/.build ./

# Set the command to run the Lambda function
CMD ["./src/lambda-handler.handler"]
