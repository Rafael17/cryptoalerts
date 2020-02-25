# Crypto Alerts
Set price alerts for cryptocurrency pairs and receive Telegram notifications

## Technologies
* AWS
* MongoDB
* Nodejs
* Docker

## Supported Exchanges
* Binance
* Bitmex

## Installation
Create a bot in Telegram using BotFather from your mobile. Write the resulting Token and Bot username in a .env file, use .env-sample for guidence. 

Install docker: <https://docs.docker.com/get-docker/>

Then run: 
```shell
$ docker-compose up -d
```
And open browser to <http://localhost>

## Deployment to AWS

Install ecs-cli
```shell
sudo curl -o /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-darwin-amd64-latest
sudo chmod +x /usr/local/bin/ecs-cli
```
ECS CLI environment to point to the desired region and ECS cluster
```shell
ecs-cli configure --region us-west-1 --cluster crypto-alerts-cluster
```


telegram-container cant find app-container HOSTNAME



create load balancer
create target group
associate load balancer to target group
add permissions to ECSrole 

create SNS.publish('PRICE_ALERT_UPDATE'); topic

