const request = require('request');
const fs = require('fs');
const Q = require('q');
const randomstring = require('randomstring');
const pathLib = require('path');
const { encrypt } = require('../utils/encryption'); // Ensure correct import path
const { decrypt } = require('../utils/decryption');
const visaConfig = require('../config/visa-config');

class funds_transfer_api {
    constructor() {
        this.domain = visaConfig.domain;
        this.userId = visaConfig.userId;
        this.password = visaConfig.password;
        this.mleKeyId = visaConfig.mleKeyId;
        this.keyFile = visaConfig.keyFile;
        this.certificateFile = visaConfig.certificateFile;
        this.mlePublicKeyPath = visaConfig.mlePublicKeyPath;
        this.proxy = visaConfig.proxy;
        this.privateKeyPath = '../keys/key.pem';
    }

    pushFunds(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/visadirect/fundstransfer/v1/pushfundstransactions';

        var body = parameters;
        var queryParameters = {};
        var headers = {};
        var form = {};

        headers['User-Agent'] = 'VDP_SampleCode_Nodejs';
        headers['keyId'] = this.mleKeyId;
        headers['Authorization'] = 'Basic ' + Buffer.from(this.userId + ':' + this.password).toString('base64');
        headers['x-correlation-id'] = randomstring.generate({
            length: 12,
            charset: 'alphanumeric'
        }) + '_SC';

        headers['x-client-transaction-id'] = randomstring.generate({
            length: 12,
            charset: 'alphanumeric'
        });

        if (parameters['X-TRANSACTION-TIMEOUT-MS'] !== undefined) {
            headers['X-TRANSACTION-TIMEOUT-MS'] = parameters['X-TRANSACTION-TIMEOUT-MS'];
        }

        if (!fs.existsSync(this.keyFile)) {
            this.keyFile = pathLib.join(__dirname, this.keyFile);
        }

        if (!fs.existsSync(this.certificateFile)) {
            this.certificateFile = pathLib.join(__dirname, this.certificateFile);
        }

        if (!fs.existsSync(this.mlePublicKeyPath)) {
            this.mlePublicKeyPath = pathLib.join(__dirname, this.mlePublicKeyPath);
        }

        if (!fs.existsSync(this.privateKeyPath)) {
            this.privateKeyPath = pathLib.join(__dirname, this.privateKeyPath);
        }

        encrypt(this.mlePublicKeyPath, this.mleKeyId, body).then(success => {
            var req = {
                method: 'POST',
                uri: domain + path,
                qs: queryParameters,
                key: fs.readFileSync(this.keyFile),
                cert: fs.readFileSync(this.certificateFile),
                headers: headers,
                body: success
            };

            if (this.proxy !== "") {
                request = request.defaults({
                    'proxy': this.proxy
                });
            }

            if (Object.keys(form).length > 0) {
                req.form = form;
            }

            if (typeof (body) === 'object' && !(body instanceof Buffer)) {
                req.json = true;
            }

            request(req, function (error, response, body) {
                if (error) {
                    console.log("error " + JSON.stringify(error));
                    deferred.reject(error);
                } else {
                    if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                        }
                    }
                    var responseBody = JSON.stringify(body);
                    if (responseBody.indexOf('encData') != -1) {
                        decrypt(this.privateKeyPath, body).then(success => {
                            response.body = success;
                            if (response.statusCode === 204) {
                                deferred.resolve({
                                    response: response
                                });
                            } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                                deferred.resolve({
                                    response: response,
                                    body: success
                                });
                            } else {
                                deferred.reject({
                                    response: response,
                                    body: body
                                });
                            }
                        })
                            .catch(err => console.log("decryption error"));
                    } else {
                        deferred.reject({
                            response: response,
                            body: body
                        });
                    }
                }
            });
        })
            .catch(err => console.log("encryption error"));
        return deferred.promise;
    }
}

module.exports = funds_transfer_api;
