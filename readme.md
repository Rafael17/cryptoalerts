# Crypto Alerts
Set price alerts for cryptocurrency pairs and receive Telegram notifications

## Technologies
* AWS (SQS, SecretManager, EC2, ECS, ELB, Target Groups, IAM roles, etc)
* MongoDB
* Nodejs
* Docker

## Supported Exchanges
* Binance
* Bitmex

## Installation
1. Rename .env-sample to .env and store AWS credentials
2. Create a bot in Telegram using BotFather from your mobile phone. Create a new secret called prod/telegram in AWS Secrets Manager and add key/value pairs `TELEGRAM_API_KEY` and `BOT_NAME` from BotFather.
3. Store the CryptoAlerts FrontEnd React build dist in an S3 bucket and update default.env `S3_FRONT_END_BUCKET`
4. Create an SQS queue and update default.env `SQS_URL_FOR_PRICE_ALERT_URL`
5. Install docker: <https://docs.docker.com/get-docker/>

Then run: 
```shell
$ docker-compose -f docker-compose-local.yml up -d
```
And open browser to <http://localhost>




