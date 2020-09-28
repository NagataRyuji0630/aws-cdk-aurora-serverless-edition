'use strict';

import { RDSDataService } from "aws-sdk";
import { ExecuteStatementRequest } from "aws-sdk/clients/rdsdataservice";

// レスポンス用ヘッダーとボディを定義
const createResponse = (status, data) => ({
    statusCode: status,
    headers: {
        'content-security-policy': 'default-src "self"; img-src "self" data :; style-src "self"; script-src "self"; frame-ancestors "self"',
        'strict-transport-security': 'max-age=63072000; includeSubdomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
    },
    body: JSON.stringify(data),
    isBase64Encoded: false,
});

exports.handler = async function(event, context) {

    return createResponse(200, 'ok');

};