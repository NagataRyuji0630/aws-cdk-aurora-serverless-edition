import { RDSDataService } from "aws-sdk";
import { ExecuteStatementRequest } from "aws-sdk/clients/rdsdataservice";

(function testQuery() {
    const rds = new RDSDataService({
        region: "ap-northeast-1",
        accessKeyId: "your AWS access key",
        secretAccessKey: "your AWS secret key"
    });

    const params: ExecuteStatementRequest = {
        resourceArn: "arn:aws:rds:ap-northeast-1:616026021527:cluster:main-yourservicename-dev-cluster", // RDS > データベース > 設定 から参照
        secretArn: "arn:aws:secretsmanager:ap-northeast-1:616026021527:secret:yourServiceName-dev-credentials-IXvOD6", // SecretManager > 追加したユーザーのSecret > シークレットのARN
        database: "main",
        sql: "select * from information_schema.tables",
        includeResultMetadata: true
    };

    rds.executeStatement(params, (err, data) => {
        if (err) {
            console.error(err, err.stack);
        } else {
            console.log(`Fetch ${data.records!.length} rows!`);
            console.log(data.columnMetadata!.map(col => col.name).join(","));
            for (const record of data.records!) {
                console.log(record.map(col => Object.values(col)[0]).join(","));
            }
        }
    });
})();