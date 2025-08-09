import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export interface PodExecutionRoleStackProps extends cdk.StackProps {
    clusterArn: string;
}

export class PodExecutionRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PodExecutionRoleStackProps) {
        super(scope, id, props);

        new Role(this, 'pod-execution-role', {
            roleName: "pod-execution-role",
            assumedBy: new ServicePrincipal('eks-fargate-pods.amazonaws.com', {
                conditions: {
                    StringEquals: {
                        'aws:SourceArn': props.clusterArn,
                    },
                }
            }),
            managedPolicies: [
                { managedPolicyArn: "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy" }
            ],
            inlinePolicies: {
                "logging-policy": new PolicyDocument({
                    statements: [new PolicyStatement({
                        actions: [
                            'logs:CreateLogGroup',
                            'logs:PutLogEvents',
                        ],
                        resources: ['*'],
                    })]
                })
            }
        })
    }
}