import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export interface PodExecutionRoleStackProps extends cdk.StackProps {
    clusterArn: string;
}

export class EksServiceRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const clusterRole = new Role(this, 'EksClusterRole', {
            roleName: 'eks-cluster-role',
            description: 'IAM role used by the EKS control plane',
            // EKS コントロールプレーンが引き受ける
            assumedBy: new ServicePrincipal('eks.amazonaws.com'),
        });

        // 必須の管理ポリシー
        clusterRole.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy')
        );

        new cdk.CfnOutput(this, 'EksClusterRoleArn', { value: clusterRole.roleArn });
    }
}