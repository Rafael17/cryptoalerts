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

## Architecture
Fully dockerized application running on a EC2 server with an Application Load Balancer and a message broker. Thus the application is loosely coupled and ready for scaling when needed.

### Containers
1. Web Server (API consumed by Frontend React <https://github.com/Rafael17/cryptoalerts-frontend>)
2. Telegram Worker (polling Telegram API)
3. Price Alert Worker (fetches exchange price data and compares it to user registered alerts)
4. MongoDB Server (with mounted volume when running in prod/EC2) run `docker volume create mongodb_volume` in prod/EC2 instance

## Installation
1. Rename .env-sample to .env and store AWS credentials
2. Create a bot in Telegram using BotFather from your mobile phone. Create a new secret called `prod/telegram` in AWS Secrets Manager and add key/value pairs `TELEGRAM_API_KEY` and `BOT_NAME` from BotFather.
3. Store the CryptoAlerts FrontEnd React build dist in an S3 bucket and update default.env `S3_FRONT_END_BUCKET`
4. Create an SQS queue and update default.env `SQS_URL_FOR_PRICE_ALERT_URL`
5. Install docker: <https://docs.docker.com/get-docker/>

Then run: 
```shell
$ docker-compose -f docker-compose-local.yml up -d
```
And open browser to <http://localhost:80>




