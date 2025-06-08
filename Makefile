# Define variables for test names and report files
REST_MEMORY_TEST_SCRIPT=rest-memory.js
REST_MEMORY_REPORT=reports/ec2/rest-memory-report.html

GRPC_MEMORY_REPORT=reports/ec2/grpc-memory-report.html
GRPC_MEMORY_TEST_SCRIPT=grpc-memory.js

REST_MEMORY_FARGATE_TEST_SCRIPT=rest-memory-fargate.js
REST_MEMORY_FARGATE_REPORT=reports/fargate/rest-memory-fargate-report.html

GRPC_MEMORY_FARGATE_TEST_SCRIPT=grpc-memory-fargate.js
GRPC_MEMORY_FARGATE_REPORT=reports/fargate/grpc-memory-fargate-report.html

# Targets for running the tests
.PHONY: test-grpc-pizza test-grpc-product test-grpc-memory test-rest-memory test-grpc-memory-fargate test-rest-memory-fargate

# Run the gRPC memory test with k6 and generate an HTML report
test-grpc-memory:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(GRPC_MEMORY_REPORT) k6 run $(GRPC_MEMORY_TEST_SCRIPT)

# Run the REST test with k6 and generate an HTML report
test-rest-memory:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(REST_MEMORY_REPORT) k6 run $(REST_MEMORY_TEST_SCRIPT)

# Run the REST test with k6 and generate an HTML report for Fargate
test-rest-memory-fargate:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(REST_MEMORY_FARGATE_REPORT) k6 run $(REST_MEMORY_FARGATE_TEST_SCRIPT)

# Run the gRPC test with k6 and generate an HTML report
test-grpc-memory-fargate:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(GRPC_MEMORY_FARGATE_REPORT) k6 run $(GRPC_MEMORY_FARGATE_TEST_SCRIPT)
