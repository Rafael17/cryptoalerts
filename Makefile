run:
	docker-compose build app-container
	docker-compose up -d

down: 
	docker-compose down