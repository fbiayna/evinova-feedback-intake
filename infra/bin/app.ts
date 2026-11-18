import { App } from "aws-cdk-lib";
import { FeedbackStack } from "../lib/feedback-stack";

const app = new App();
new FeedbackStack(app, "FeedbackIntake");
