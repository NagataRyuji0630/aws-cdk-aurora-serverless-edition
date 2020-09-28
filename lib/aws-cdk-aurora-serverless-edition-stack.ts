import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as secretsManager from '@aws-cdk/aws-secretsmanager';
import * as ssm from '@aws-cdk/aws-ssm';

//**************************************************** */
// 変数部分は自由に編集してください。
const databaseUsername = 'your_database';
const databasePassword = 'yourpassword'
const serviceName = 'yourServiceName';
const stage = 'dev';
//**************************************************** */

export class AwsCdkAuroraServerlessEditionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //**************************************************** */
    // Secret Managerの定義
    //**************************************************** */
    const databaseCredentialsSecret = new secretsManager.Secret(this, 'DBCredentialsSecret', {
      secretName: `${serviceName}-${stage}-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: databaseUsername,
          password: databasePassword
        }),
        excludePunctuation: true,
        includeSpace: false,
        // パスワードフィールドにランダムなパスワードを生成する場合は、generateStringKeyオプションを有効化
        // generateStringKey: 'password'
      }
    });

    //**************************************************** */
    //データベースの資格情報をSSMパラメーターストアに保存
    //**************************************************** */
    new ssm.StringParameter(this, 'DBCredentialsArn', {
      parameterName: `${serviceName}-${stage}-credentials-arn`,
      stringValue: databaseCredentialsSecret.secretArn,
    });

    //**************************************************** */
    //Auroraインスタンスの構成
    //**************************************************** */
    const isDev = true;

    const rdsCluster = new rds.CfnDBCluster(this, 'DBCluster', {
      dbClusterIdentifier: `main-${serviceName}-${stage}-cluster`,
      // Auroraをサーバーレスインスタンスに変換
      engineMode: 'serverless',
      engine: 'aurora-postgresql',
      engineVersion: '10.7',
      // Data API設定の有効化
      enableHttpEndpoint: true,
      databaseName: 'main',
      // シークレットマネージャーの情報を参照
      masterUsername: databaseCredentialsSecret.secretValueFromJson('username').toString(),
      masterUserPassword: databaseCredentialsSecret.secretValueFromJson('password').toString(),
      backupRetentionPeriod: isDev ? 1 : 30,
      // 展開段階に応じて異なるスケーリング構成を設定。開発の場合は、本番環境でmaxCapacityを低く、高く保つように設定。
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: isDev ? 4 : 384,
        minCapacity: 2,
        secondsUntilAutoPause: isDev ? 3600 : 10800,
      },
      deletionProtection: isDev ? false : true,
    });

    // CFNClusterは、他のCDKコンストラクターとは異なりリソースARNを出力しないため、手動で構築する必要がある
    const dbClusterArn = `arn:aws:rds:${this.region}:${this.account}:cluster:${rdsCluster.ref}`;

    // 認証資格情報ARNと一緒に使用し、関連するAuroraSDKを介してクエリを実行可能にする。
    new ssm.StringParameter(this, 'DBResourceArn', {
      parameterName: `${serviceName}-${stage}-resourcearn`,
      stringValue: dbClusterArn,
    });
  }
}


