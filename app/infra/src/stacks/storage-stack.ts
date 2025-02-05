import { Construct } from "constructs";
import { Stack, RemovalPolicy, StackProps } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { NamingConventionProps } from "../types";
import { outputs } from "../utils/output";

export type StorageStackProps = StackProps & NamingConventionProps;

export class StorageStack extends Stack {
  tables: Record<string, Table> = {};
  buckets: Record<string, Bucket> = {};

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);
    const { namingConvention } = props;

    // users
    this.tables["users-table"] = new Table(
      this,
      namingConvention("users-table"),
      {
        tableName: namingConvention("users-table"),
        partitionKey: { name: "id", type: AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // frontend storage
    this.buckets["frontend-bucket"] = new Bucket(
      this,
      namingConvention("frontend-bucket"),
      {
        bucketName: namingConvention("frontend-bucket"),
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        publicReadAccess: true,
        removalPolicy: RemovalPolicy.DESTROY,
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      }
    );

    // media storage
    this.buckets["media-bucket"] = new Bucket(
      this,
      namingConvention("media-bucket"),
      {
        bucketName: namingConvention("media-bucket"),
      }
    );
    this.tables["media-table"] = new Table(
      this,
      namingConvention("media-table"),
      {
        partitionKey: {
          name: "mediaId",
          type: AttributeType.STRING,
        },
        tableName: namingConvention("media-table"),
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );
    this.tables["media-table"].addGlobalSecondaryIndex({
      indexName: "bySource",
      partitionKey: {
        name: "sourceTableName#sourceId#usage",
        type: AttributeType.STRING,
      },
      sortKey: { name: "mediaId", type: AttributeType.STRING },
    });

    outputs(this, namingConvention("output"), {
      tables: JSON.stringify(
        Object.values(this.tables).map((table: any) => table.tableName)
      ),
      buckets: JSON.stringify(
        Object.values(this.buckets).map((bucket: any) => bucket.bucketName)
      ),
    });
  }
}
