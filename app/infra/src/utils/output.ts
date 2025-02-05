import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

// this is a very ugly hack, but i'm counting on this loading before the outputs get parsed
let changeCase: Record<string, (value: string) => string>;
import("change-case").then((c: unknown) => {
  changeCase = c as Record<string, (value: string) => string>;
});

export const outputs = (
  scope: Construct,
  baseName: string,
  obj: Record<string, string>
): CfnOutput[] => {
  return Object.entries(obj).map((entry) => {
    const [exportName, value] = entry;
    return new CfnOutput(scope, `${baseName}-${exportName}-output`, {
      key: changeCase.camelCase(exportName),
      exportName: exportName,
      value,
    });
  });
};
