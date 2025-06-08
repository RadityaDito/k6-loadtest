# Define variables for test names and report files
REST_MEMORY_TEST_SCRIPT=rest-memory.js
REST_MEMORY_REPORT=reports/ec2/rest-memory-report.html

GRPC_MEMORY_REPORT=reports/ec2/grpc-memory-report.html
GRPC_MEMORY_TEST_SCRIPT=grpc-memory.js

REST_MEMORY_FARGATE_TEST_SCRIPT=rest-memory-fargate.js
REST_MEMORY_FARGATE_REPORT=reports/fargate/rest-memory-fargate-report.html

GRPC_MEMORY_FARGATE_TEST_SCRIPT=grpc-memory-fargate.js
GRPC_MEMORY_FARGATE_REPORT=reports/fargate/grpc-memory-fargate-report.html

# Default value for MAX_VUS if not provided
MAX_VUS ?= 1000

# Targets for running the tests
.PHONY: test-grpc-pizza test-grpc-product test-grpc-memory test-rest-memory test-grpc-memory-fargate test-rest-memory-fargate test-rest-memory-fargate-100 test-rest-memory-fargate-500 test-rest-memory-fargate-1000 test-grpc-memory-fargate-100 test-grpc-memory-fargate-500 test-grpc-memory-fargate-1000

# Run the gRPC memory test with k6 and generate an HTML report
test-grpc-memory:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(GRPC_MEMORY_REPORT) k6 run $(GRPC_MEMORY_TEST_SCRIPT)

# Run the REST test with k6 and generate an HTML report
test-rest-memory:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(REST_MEMORY_REPORT) k6 run $(REST_MEMORY_TEST_SCRIPT)

# Run the REST test with k6 and generate an HTML report for Fargate
test-rest-memory-fargate:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(REST_MEMORY_FARGATE_REPORT) MAX_VUS=$(MAX_VUS) k6 run $(REST_MEMORY_FARGATE_TEST_SCRIPT)

# Run the gRPC test with k6 and generate an HTML report
test-grpc-memory-fargate:
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$(GRPC_MEMORY_FARGATE_REPORT) MAX_VUS=$(MAX_VUS) k6 run $(GRPC_MEMORY_FARGATE_TEST_SCRIPT)

# Convenience targets with predefined VU counts
test-rest-memory-fargate-100:
	$(MAKE) test-rest-memory-fargate MAX_VUS=100

test-rest-memory-fargate-500:
	$(MAKE) test-rest-memory-fargate MAX_VUS=500

test-grpc-memory-fargate-100:
	$(MAKE) test-grpc-memory-fargate MAX_VUS=100

test-grpc-memory-fargate-500:
	$(MAKE) test-grpc-memory-fargate MAX_VUS=500
	
test-rest-memory-fargate-1000:
	$(MAKE) test-rest-memory-fargate MAX_VUS=1000
	
test-grpc-memory-fargate-1000:
	$(MAKE) test-grpc-memory-fargate MAX_VUS=1000
