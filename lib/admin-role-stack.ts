import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ManagedPolicy, Role, AccountRootPrincipal } from 'aws-cdk-lib/aws-iam';

export interface AdminRoleStackProps extends cdk.StackProps {

}

export class AdminRoleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: AdminRoleStackProps) {
        super(scope, id, props);

        // AWS全リソースに対してフルアクセスできるロール
        const adminRole = new Role(this, 'AccountAdminRole', {
            roleName: 'account-admin-role',
            assumedBy: new AccountRootPrincipal(),
            // アカウント内のIAMユーザー/Identity Centerユーザーを想定
            description: 'Full admin role with AdministratorAccess policy',
        });

        // 管理者権限ポリシーを付与
        adminRole.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
        );
    }
}