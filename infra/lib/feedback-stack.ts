import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function as LambdaFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";
import { fileURLToPath } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../../src", import.meta.url));

// The AWS target from the README. Checked with `cdk synth`, never deployed.
// Browser -> CloudFront -> S3 (web) and /feedback* -> HTTP API -> Lambda -> DynamoDB.
export class FeedbackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, "Feedback", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Created with a random value. The real key is set by hand in the console, never in code.
    const anthropicKey = new Secret(this, "AnthropicApiKey");

    // Placeholder code: the Lambda adapter for Fastify is not built (see HARDENING.md).
    const api = new LambdaFunction(this, "Api", {
      runtime: Runtime.NODEJS_22_X,
      handler: "lambda.handler",
      code: Code.fromAsset(SRC_DIR),
      // Above the 20 s the model calls can take, below the 30 s of the HTTP API.
      timeout: Duration.seconds(29),
      memorySize: 512,
      environment: {
        EXTRACTOR: "anthropic",
        ANTHROPIC_MODEL: "claude-haiku-5-5",
        TABLE_NAME: table.tableName,
        ANTHROPIC_SECRET_ARN: anthropicKey.secretArn,
      },
    });
    table.grantReadWriteData(api);
    anthropicKey.grantRead(api);

    const httpApi = new HttpApi(this, "HttpApi");
    const integration = new HttpLambdaIntegration("ApiIntegration", api);
    httpApi.addRoutes({ path: "/feedback", methods: [HttpMethod.GET, HttpMethod.POST], integration });
    httpApi.addRoutes({ path: "/feedback/{id}", methods: [HttpMethod.GET], integration });

    const webBucket = new Bucket(this, "Web", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });

    // One origin for the browser: the dashboard from S3 and /feedback* from the API, so no CORS.
    const distribution = new cloudfront.Distribution(this, "Cdn", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(webBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "/feedback*": {
          origin: new origins.HttpOrigin(Fn.select(2, Fn.split("/", httpApi.apiEndpoint))),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    new CfnOutput(this, "WebUrl", { value: `https://${distribution.distributionDomainName}` });
  }
}
