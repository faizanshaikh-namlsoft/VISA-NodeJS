const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const privateKey = fs.readFileSync(path.join(__dirname, '../keys/key.pem'), 'utf8');

function decrypt(privateKey, data) {
    return new Promise((resolve, reject) => {
        try {
            const buffer = Buffer.from(data.encData, 'base64');
            const decrypted = crypto.privateDecrypt({
                key: privateKey,
                passphrase: '',
            }, buffer);
            resolve(decrypted.toString('utf8'));
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    decrypt
};
