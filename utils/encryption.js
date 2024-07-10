const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Function to encrypt data
function encrypt(publicKeyPath, keyId, data) {
    return new Promise((resolve, reject) => {
        // Load public key from file
        fs.readFile(publicKeyPath, 'utf8', (err, publicKey) => {
            if (err) {
                reject(err);
            } else {
                // Encrypt data using public key
                const bufferData = Buffer.from(JSON.stringify(data), 'utf8');
                const encryptedData = crypto.publicEncrypt({
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING
                }, bufferData);

                resolve({
                    keyId: keyId,
                    encData: encryptedData.toString('base64')
                });
            }
        });
    });
}

// Function to decrypt data
function decrypt(privateKeyPath, encryptedData) {
    return new Promise((resolve, reject) => {
        // Load private key from file
        fs.readFile(privateKeyPath, 'utf8', (err, privateKey) => {
            if (err) {
                reject(err);
            } else {
                // Decrypt data using private key
                const bufferEncData = Buffer.from(encryptedData.encData, 'base64');
                const decryptedData = crypto.privateDecrypt({
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING
                }, bufferEncData);

                resolve(JSON.parse(decryptedData.toString('utf8')));
            }
        });
    });
}

module.exports = {
    encrypt,
    decrypt
};
