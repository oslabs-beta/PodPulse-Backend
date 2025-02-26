#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineStack } from '../lib/cdk-pipeline-stack';

/**
 * This is what is deployed when you run `cdk deploy` locally, and will be seen in Cloudformation
 */

const app = new cdk.App();
// PUG TODO- fix name
new CdkPipelineStack(app, 'CdkBedrockAppStack', {
  stackName: 'CdkPipelineStack',
  description: 'AWS CodePipeline for CDK Bedrock Stack',
});
