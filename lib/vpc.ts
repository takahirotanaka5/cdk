import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'


export interface VpcStackProps extends cdk.StackProps {
  availabilityZones: string[];
  cidr: string;
}

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    // NATなし・ALB用の最小Public + ワークロード用Private(Isolated)
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      availabilityZones: props.availabilityZones,
      natGateways: 0, // コスト最小化

      subnetConfiguration: [
        // ALB だけを置く最小Public（/28推奨：16IP）
        {
          name: 'public-alb',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 28,
        },
        // EKS/FargateのPodやシステム系を置くPrivate(外向きはVPCEのみ)
        {
          name: 'private-app',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],

      enableDnsSupport: true,
      enableDnsHostnames: true,
    });

    // ===== VPCエンドポイント（NATなし運用の要）=====
    // S3: ゲートウェイ型（ルートテーブルに自動で関連付け）
    vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      // どのサブネットのRTに関連付けるか（privateに付ければOK）
      subnets: [{ subnets: vpc.isolatedSubnets }],
    });

    // ECR (API/DKR), CloudWatch Logs, STS: インターフェース型
    const interfaceEndpointSubnets: ec2.SubnetSelection = {
      subnets: vpc.isolatedSubnets, // Privateから解決できればOK
    };

    vpc.addInterfaceEndpoint('EcrApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR, // ecr.api
      subnets: interfaceEndpointSubnets,
      privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint('EcrDkrEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER, // ecr.dkr
      subnets: interfaceEndpointSubnets,
      privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint('LogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: interfaceEndpointSubnets,
      privateDnsEnabled: true,
    });

    vpc.addInterfaceEndpoint('StsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.STS,
      subnets: interfaceEndpointSubnets,
      privateDnsEnabled: true,
    });

    // （必要に応じて）KMS, EC2, Secrets Manager, SSM なども追加してください
    // vpc.addInterfaceEndpoint('KmsEndpoint', { service: ec2.InterfaceVpcEndpointAwsService.KMS, subnets: interfaceEndpointSubnets });

  }
}
