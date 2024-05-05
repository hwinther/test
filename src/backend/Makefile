.PHONY: run
run:
	mkdir -p log
	chmod 777 log
	mkdir -p rabbitmq/data
	chmod 777 rabbitmq/data
	mkdir -p rabbitmq/log
	chmod 777 rabbitmq/log
	docker compose up -d --build

.PHONY: clean
clean:
	docker compose down --remove-orphans
	rm -rf log rabbitmq

.PHONY: wait
wait:
	until [ -f "./log/traces.log" ] && [ -f "./log/metrics.log" ] && [ -f "./log/logs.log" ]; do sleep 5; done

.PHONY: test
test: run wait clean
