require('dotenv').config();

const AWS           = require('aws-sdk');
const { Consumer }    = require('sqs-consumer');

/*
const credentials = new AWS.SharedIniFileCredentials();
AWS.config = new AWS.Config({
    credentials: credentials, 
    region: process.env.AWS_REGION
});
*/
AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const queueURLs = {
    PRICE_ALERT_UPDATED: 'https://sqs.us-west-1.amazonaws.com/263846239257/CryptoAlerts-priceAlertUpdate'
}

const SQS = {
    send: (name) => {
        sqs.sendMessage({
            DelaySeconds: 0,
            MessageBody: 'PRICE_ALERT_UPDATED',
            QueueUrl: queueURLs[name]
        }, (err, data) => {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.MessageId);
            }
        });
    },

    longPoll: (name, handleMessage) => {
        const app = Consumer.create({
            queueUrl: queueURLs[name],
            handleMessage: handleMessage,
            visibilityTimeout: 30,
            sqs: new AWS.SQS()
        });

        app.on('error', (err) => {
            console.log(err.message);
        });

        app.on('processing_error', (err) => {
          console.error(err.message);
        });

        app.on('timeout_error', (err) => {
         console.error(err.message);
        })

        return app;
    },

    receive: (name) => {
        sqs.receiveMessage({
            QueueUrl: queueURLs[name],
            VisibilityTimeout: 20,
            WaitTimeSeconds: 0
        }, (err, data) => {
            if (err) {
                console.log("Error", err);
            } else if (data.Messages) {
                const deleteParams = {
                    QueueUrl: queueURLs[name],
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                    if (err) {
                        console.log("Delete Error", err);
                    } else {
                        console.log("Message Deleted", data);
                    }
                });
            }
        });
    }
}

SQS.receive('PRICE_ALERT_UPDATED');

module.exports = SQS;