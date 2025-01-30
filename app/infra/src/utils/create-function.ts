import { LambdaDeploymentConfig } from "aws-cdk-lib/aws-codedeploy";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { getLatestImageSha } from "./get-image-sha";

export function createFunction(
  scope: Construct,
  name: string,
  {
    environment,
  }: {
    environment: Record<string, string>;
  }
) {
  const repository = Repository.fromRepositoryName(scope, `${name}-ecr`, name);
  const func = new DockerImageFunction(scope, `${name}-function`, {
    functionName: `${name}-function`,
    code: DockerImageCode.fromEcr(repository, {
      tagOrDigest: getLatestImageSha(name),
    }),
    environment: {
      //CACHE_BUSTER: new Date().toISOString(),
      ...environment,
    },
  });
  repository.grantPull(func);
  return {
    func,
    repository,
  };
}
