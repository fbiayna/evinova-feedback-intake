import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { FeedbackStack } from "../infra/lib/feedback-stack";

const template = Template.fromStack(new FeedbackStack(new App(), "Test"));

describe("Infrastructure", () => {
  it("keeps the web bucket private", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: Match.objectLike({ BlockPublicAcls: true, RestrictPublicBuckets: true }),
    });
  });

  it("gives the Lambda a reference to the key, never the key itself", () => {
    const [lambda] = Object.values(template.findResources("AWS::Lambda::Function"));
    const variables = Object.keys(lambda?.Properties.Environment.Variables ?? {});
    expect(variables).toContain("ANTHROPIC_SECRET_ARN");
    expect(variables).not.toContain("ANTHROPIC_API_KEY");
  });
});
