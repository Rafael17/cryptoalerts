require('dotenv').config();

const AWS = require('aws-sdk');
//const secretName = "prod/telegram";
const region = process.env.AWS_REGION || 'us-west-1';

if(process.env.AWS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    });
} else {
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
}

getSecret = (secretName) => {

    const client = new AWS.SecretsManager({region: region});

    const promise = new Promise((resolve, reject) => {
        client.getSecretValue({SecretId: secretName}, function(err, data) {
            let secret;
            if (err) {
                reject(err);
            }
            else {
                if ('SecretString' in data) {
                    secret =JSON.parse(data.SecretString);
                    resolve(secret);
                } 
            }
            
        });
    });
    return promise;
}

module.exports = getSecret;