# Crypto Alerts
Set price alerts for cryptocurrency pairs and receive Telegram notifications
https://rafaelarcieri.com/

## Technologies
* AWS (EC2, ECS, ELB, Target Groups, IAM roles, SQS, SecretManager, etc)
* MongoDB
* Nodejs
* Docker

## Supported Exchanges
* Binance
* Bitmex

## Architecture
Fully dockerized application running on a EC2 server with an Application Load Balancer. Thus the application is loosely coupled and ready for scaling when needed.

### Containers
1. Web Server (API consumed by Frontend React <https://github.com/Rafael17/cryptoalerts-frontend>)
2. Telegram Service (polling Telegram API)
3. Exchange Agreggator Service (fetches exchange price data and compares it to user created alerts)

## Local Installation
1. Create a bot in Telegram using BotFather from your mobile phone and add `TELEGRAM_API_KEY` and `BOT_NAME` from BotFather in .env file
2. clone and run `npm run build` on [CryptoAlerts FrontEnd React](https://github.com/Rafael17/cryptoalerts-frontend) and move the resulting dist files into dist folder for the current repo
3. Install [docker](https://docs.docker.com/get-docker/)

Then run: 
```shell
$ docker-compose -f docker-compose-local.yml up -d
```
And open browser to <http://localhost:80>




