require('dotenv').config();

const AWS           = require('aws-sdk');
const { Consumer }    = require('sqs-consumer');

AWS.config.update({
    region: process.env.AWS_REGION
});

if(process.env.AWS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    });
} else {
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
}

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const SQS = {
    send: (url) => {
        sqs.sendMessage({
            DelaySeconds: 0,
            MessageBody: 'PRICE_ALERT_UPDATED',
            QueueUrl: url
        }, (err, data) => {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.MessageId);
            }
        });
    },

    longPoll: (url, handleMessage) => {
        const app = Consumer.create({
            queueUrl: url,
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

    receive: (url) => {
        sqs.receiveMessage({
            QueueUrl: url,
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

module.exports = SQS;