"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCdkAuroraServerlessEditionStack = void 0;
const cdk = require("@aws-cdk/core");
const rds = require("@aws-cdk/aws-rds");
const secretsManager = require("@aws-cdk/aws-secretsmanager");
const ssm = require("@aws-cdk/aws-ssm");
//**************************************************** */
// 変数部分は自由に編集してください。
const databaseUsername = 'movies_database';
const serviceName = 'yourServiceName';
const stage = 'dev';
//**************************************************** */
class AwsCdkAuroraServerlessEditionStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //**************************************************** */
        // Secret Managerの定義
        //**************************************************** */
        const databaseCredentialsSecret = new secretsManager.Secret(this, 'DBCredentialsSecret', {
            secretName: `${serviceName}-${stage}-credentials`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: databaseUsername,
                }),
                excludePunctuation: true,
                includeSpace: false,
                generateStringKey: 'password'
            }
        });
        //**************************************************** */
        //データベースの資格情報をSSMパラメーターストアに保存
        //**************************************************** */
        new ssm.StringParameter(this, 'DBCredentialsArn', {
            parameterName: `${serviceName}-${stage}-credentials_arn`,
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
            // httpエンドポイントからのアクセスを許可
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
exports.AwsCdkAuroraServerlessEditionStack = AwsCdkAuroraServerlessEditionStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWNkay1hdXJvcmEtc2VydmVybGVzcy1lZGl0aW9uLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXdzLWNkay1hdXJvcmEtc2VydmVybGVzcy1lZGl0aW9uLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyx3Q0FBd0M7QUFDeEMsOERBQThEO0FBQzlELHdDQUF3QztBQUV4Qyx5REFBeUQ7QUFDekQsb0JBQW9CO0FBQ3BCLE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFDM0MsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUM7QUFDdEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLHlEQUF5RDtBQUV6RCxNQUFhLGtDQUFtQyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQy9ELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIseURBQXlEO1FBQ3pELG9CQUFvQjtRQUNwQix5REFBeUQ7UUFDekQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ3ZGLFVBQVUsRUFBRSxHQUFHLFdBQVcsSUFBSSxLQUFLLGNBQWM7WUFDakQsb0JBQW9CLEVBQUU7Z0JBQ3BCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ25DLFFBQVEsRUFBRSxnQkFBZ0I7aUJBQzNCLENBQUM7Z0JBQ0Ysa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLGlCQUFpQixFQUFFLFVBQVU7YUFDOUI7U0FDRixDQUFDLENBQUM7UUFFSCx5REFBeUQ7UUFDekQsNkJBQTZCO1FBQzdCLHlEQUF5RDtRQUN6RCxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2hELGFBQWEsRUFBRSxHQUFHLFdBQVcsSUFBSSxLQUFLLGtCQUFrQjtZQUN4RCxXQUFXLEVBQUUseUJBQXlCLENBQUMsU0FBUztTQUNqRCxDQUFDLENBQUM7UUFFSCx5REFBeUQ7UUFDekQsaUJBQWlCO1FBQ2pCLHlEQUF5RDtRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDekQsbUJBQW1CLEVBQUUsUUFBUSxXQUFXLElBQUksS0FBSyxVQUFVO1lBQzNELHlCQUF5QjtZQUN6QixVQUFVLEVBQUUsWUFBWTtZQUN4QixNQUFNLEVBQUUsbUJBQW1CO1lBQzNCLGFBQWEsRUFBRSxNQUFNO1lBQ3JCLHdCQUF3QjtZQUN4QixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLHFCQUFxQjtZQUNyQixjQUFjLEVBQUUseUJBQXlCLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ3BGLGtCQUFrQixFQUFFLHlCQUF5QixDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUN4RixxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQywrREFBK0Q7WUFDL0Qsb0JBQW9CLEVBQUU7Z0JBQ3BCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDNUIsV0FBVyxFQUFFLENBQUM7Z0JBQ2QscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7YUFDNUM7WUFDRCxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUN6QyxDQUFDLENBQUM7UUFFSCw2REFBNkQ7UUFDN0QsTUFBTSxZQUFZLEdBQUcsZUFBZSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTVGLGlEQUFpRDtRQUNqRCxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM3QyxhQUFhLEVBQUUsR0FBRyxXQUFXLElBQUksS0FBSyxjQUFjO1lBQ3BELFdBQVcsRUFBRSxZQUFZO1NBQzFCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWhFRCxnRkFnRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5pbXBvcnQgKiBhcyByZHMgZnJvbSAnQGF3cy1jZGsvYXdzLXJkcyc7XG5pbXBvcnQgKiBhcyBzZWNyZXRzTWFuYWdlciBmcm9tICdAYXdzLWNkay9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0ICogYXMgc3NtIGZyb20gJ0Bhd3MtY2RrL2F3cy1zc20nO1xuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cbi8vIOWkieaVsOmDqOWIhuOBr+iHqueUseOBq+e3qOmbhuOBl+OBpuOBj+OBoOOBleOBhOOAglxuY29uc3QgZGF0YWJhc2VVc2VybmFtZSA9ICdtb3ZpZXNfZGF0YWJhc2UnO1xuY29uc3Qgc2VydmljZU5hbWUgPSAneW91clNlcnZpY2VOYW1lJztcbmNvbnN0IHN0YWdlID0gJ2Rldic7XG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuZXhwb3J0IGNsYXNzIEF3c0Nka0F1cm9yYVNlcnZlcmxlc3NFZGl0aW9uU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG4gICAgLy8gU2VjcmV0IE1hbmFnZXLjga7lrprnvqlcbiAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cbiAgICBjb25zdCBkYXRhYmFzZUNyZWRlbnRpYWxzU2VjcmV0ID0gbmV3IHNlY3JldHNNYW5hZ2VyLlNlY3JldCh0aGlzLCAnREJDcmVkZW50aWFsc1NlY3JldCcsIHtcbiAgICAgIHNlY3JldE5hbWU6IGAke3NlcnZpY2VOYW1lfS0ke3N0YWdlfS1jcmVkZW50aWFsc2AsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHVzZXJuYW1lOiBkYXRhYmFzZVVzZXJuYW1lLFxuICAgICAgICB9KSxcbiAgICAgICAgZXhjbHVkZVB1bmN0dWF0aW9uOiB0cnVlLFxuICAgICAgICBpbmNsdWRlU3BhY2U6IGZhbHNlLFxuICAgICAgICBnZW5lcmF0ZVN0cmluZ0tleTogJ3Bhc3N3b3JkJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG4gICAgLy/jg4fjg7zjgr/jg5njg7zjgrnjga7os4fmoLzmg4XloLHjgpJTU03jg5Hjg6njg6Hjg7zjgr/jg7zjgrnjg4jjgqLjgavkv53lrZhcbiAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cbiAgICBuZXcgc3NtLlN0cmluZ1BhcmFtZXRlcih0aGlzLCAnREJDcmVkZW50aWFsc0FybicsIHtcbiAgICAgIHBhcmFtZXRlck5hbWU6IGAke3NlcnZpY2VOYW1lfS0ke3N0YWdlfS1jcmVkZW50aWFsc19hcm5gLFxuICAgICAgc3RyaW5nVmFsdWU6IGRhdGFiYXNlQ3JlZGVudGlhbHNTZWNyZXQuc2VjcmV0QXJuLFxuICAgIH0pO1xuXG4gICAgLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG4gICAgLy9BdXJvcmHjgqTjg7Pjgrnjgr/jg7Pjgrnjga7mp4vmiJBcbiAgICAvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cbiAgICBjb25zdCBpc0RldiA9IHRydWU7XG5cbiAgICBjb25zdCByZHNDbHVzdGVyID0gbmV3IHJkcy5DZm5EQkNsdXN0ZXIodGhpcywgJ0RCQ2x1c3RlcicsIHtcbiAgICAgIGRiQ2x1c3RlcklkZW50aWZpZXI6IGBtYWluLSR7c2VydmljZU5hbWV9LSR7c3RhZ2V9LWNsdXN0ZXJgLFxuICAgICAgLy8gQXVyb3Jh44KS44K144O844OQ44O844Os44K544Kk44Oz44K544K/44Oz44K544Gr5aSJ5o+bXG4gICAgICBlbmdpbmVNb2RlOiAnc2VydmVybGVzcycsXG4gICAgICBlbmdpbmU6ICdhdXJvcmEtcG9zdGdyZXNxbCcsXG4gICAgICBlbmdpbmVWZXJzaW9uOiAnMTAuNycsXG4gICAgICAvLyBodHRw44Ko44Oz44OJ44Od44Kk44Oz44OI44GL44KJ44Gu44Ki44Kv44K744K544KS6Kix5Y+vXG4gICAgICBlbmFibGVIdHRwRW5kcG9pbnQ6IHRydWUsXG4gICAgICBkYXRhYmFzZU5hbWU6ICdtYWluJyxcbiAgICAgIC8vIOOCt+ODvOOCr+ODrOODg+ODiOODnuODjeODvOOCuOODo+ODvOOBruaDheWgseOCkuWPgueFp1xuICAgICAgbWFzdGVyVXNlcm5hbWU6IGRhdGFiYXNlQ3JlZGVudGlhbHNTZWNyZXQuc2VjcmV0VmFsdWVGcm9tSnNvbigndXNlcm5hbWUnKS50b1N0cmluZygpLFxuICAgICAgbWFzdGVyVXNlclBhc3N3b3JkOiBkYXRhYmFzZUNyZWRlbnRpYWxzU2VjcmV0LnNlY3JldFZhbHVlRnJvbUpzb24oJ3Bhc3N3b3JkJykudG9TdHJpbmcoKSxcbiAgICAgIGJhY2t1cFJldGVudGlvblBlcmlvZDogaXNEZXYgPyAxIDogMzAsXG4gICAgICAvLyDlsZXplovmrrXpmo7jgavlv5zjgZjjgabnlbDjgarjgovjgrnjgrHjg7zjg6rjg7PjgrDmp4vmiJDjgpLoqK3lrprjgILplovnmbrjga7loLTlkIjjga/jgIHmnKznlarnkrDlooPjgadtYXhDYXBhY2l0eeOCkuS9juOBj+OAgemrmOOBj+S/neOBpOOCiOOBhuOBq+ioreWumuOAglxuICAgICAgc2NhbGluZ0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgYXV0b1BhdXNlOiB0cnVlLFxuICAgICAgICBtYXhDYXBhY2l0eTogaXNEZXYgPyA0IDogMzg0LFxuICAgICAgICBtaW5DYXBhY2l0eTogMixcbiAgICAgICAgc2Vjb25kc1VudGlsQXV0b1BhdXNlOiBpc0RldiA/IDM2MDAgOiAxMDgwMCxcbiAgICAgIH0sXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGlzRGV2ID8gZmFsc2UgOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ0ZOQ2x1c3RlcuOBr+OAgeS7luOBrkNES+OCs+ODs+OCueODiOODqeOCr+OCv+ODvOOBqOOBr+eVsOOBquOCiuODquOCveODvOOCuUFSTuOCkuWHuuWKm+OBl+OBquOBhOOBn+OCgeOAgeaJi+WLleOBp+ani+evieOBmeOCi+W/heimgeOBjOOBguOCi1xuICAgIGNvbnN0IGRiQ2x1c3RlckFybiA9IGBhcm46YXdzOnJkczoke3RoaXMucmVnaW9ufToke3RoaXMuYWNjb3VudH06Y2x1c3Rlcjoke3Jkc0NsdXN0ZXIucmVmfWA7XG5cbiAgICAvLyDoqo3oqLzos4fmoLzmg4XloLFBUk7jgajkuIDnt5Ljgavkvb/nlKjjgZfjgIHplqLpgKPjgZnjgotBdXJvcmFTREvjgpLku4vjgZfjgabjgq/jgqjjg6rjgpLlrp/ooYzlj6/og73jgavjgZnjgovjgIJcbiAgICBuZXcgc3NtLlN0cmluZ1BhcmFtZXRlcih0aGlzLCAnREJSZXNvdXJjZUFybicsIHtcbiAgICAgIHBhcmFtZXRlck5hbWU6IGAke3NlcnZpY2VOYW1lfS0ke3N0YWdlfS1yZXNvdXJjZWFybmAsXG4gICAgICBzdHJpbmdWYWx1ZTogZGJDbHVzdGVyQXJuLFxuICAgIH0pO1xuICB9XG59XG4iXX0=