import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { ServicePrincipal, AccountRootPrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class EcrRepositoriesStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & {
      namingConvention: (name: string) => string;
    }
  ) {
    super(scope, id, props);

    const { namingConvention } = props;

    // List of image names for which ECR repositories will be created
    const imageNames: string[] = [
      "lambda-base",
      "user-confirmed",
      "media-created",
      "express",
    ];

    // Loop through the image names and create an ECR repository for each
    imageNames.forEach((imageName) => {
      const repository = new ecr.Repository(
        this,
        namingConvention(`${imageName}-ecr`),
        {
          repositoryName: namingConvention(imageName),
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          imageScanOnPush: true,
          lifecycleRules: [
            {
              rulePriority: 1,
              description: "Remove untagged images after 30 days",
              tagStatus: ecr.TagStatus.UNTAGGED,
              maxImageAge: cdk.Duration.days(30),
            },
          ],
        }
      );

      // Add a policy to allow the current account to push and pull images
      repository.addLifecycleRule({
        maxImageCount: 10, // Retain only the last 10 images
      });

      // Grant permissions for Lambda to pull images from this repository
      const lambdaServicePrincipal = new ServicePrincipal(
        "lambda.amazonaws.com"
      );

      repository.grantPull(lambdaServicePrincipal);

      // Grant permissions for the current account to push/pull images
      repository.grantPullPush(new AccountRootPrincipal());
    });
  }
}
