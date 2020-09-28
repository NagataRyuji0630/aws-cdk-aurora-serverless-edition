#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkAuroraServerlessEditionStack } from '../lib/aws-cdk-aurora-serverless-edition-stack';

const app = new cdk.App();
new AwsCdkAuroraServerlessEditionStack(app, 'AwsCdkAuroraServerlessEditionStack');
