.PHONY: run
run:
	mkdir -p docker-volumes/log && chmod 777 docker-volumes/log
	mkdir -p docker-volumes/rabbitmq/data && chmod 777 docker-volumes/rabbitmq/data
	mkdir -p docker-volumes/rabbitmq/log && chmod 777 docker-volumes/rabbitmq/log
	mkdir -p docker-volumes/mssql/data && chmod 777 docker-volumes/mssql/data
	mkdir -p docker-volumes/mssql/log && chmod 777 docker-volumes/mssql/log
	mkdir -p docker-volumes/mssql/secrets && chmod 777 docker-volumes/mssql/secrets
	docker compose up -d --build

.PHONY: clean
clean:
	docker compose down --remove-orphans
	rm -rf log rabbitmq

.PHONY: wait
wait:
	until [ -f "./docker-volumes/log/traces.log" ] && [ -f "./docker-volumes/log/metrics.log" ] && [ -f "./docker-volumes/log/logs.log" ]; do sleep 5; done

.PHONY: test
test: run wait clean
