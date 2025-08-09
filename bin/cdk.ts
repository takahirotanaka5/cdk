#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc';
import { AdminRoleStack } from '../lib/admin-role-stack';
import { PodExecutionRoleStack } from '../lib/pod-execution-role-stack';
import { EksServiceRoleStack } from '../lib/eks-service-role-stack';

const app = new cdk.App();
const config = app.node.tryGetContext("config");

new VpcStack(app, "VpcStack", {
  availabilityZones: config.availabilityZones,
  cidr: config.cidr
});

new EksServiceRoleStack(app, "EksServiceRole", { })

new PodExecutionRoleStack(app, "PodExecutionRole", {
  clusterArn: config.clusterArn
})

new AdminRoleStack(app, "AdminRole",{ })
