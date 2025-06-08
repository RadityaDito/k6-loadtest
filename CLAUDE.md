# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains k6 load testing scripts for comparing REST and gRPC APIs with in-memory data stores, deployed on both EC2 and Fargate. The tests are designed to measure performance metrics like response time, throughput, and failure rates under various load conditions.

## Common Commands

### Running Tests

Run specific test scenarios:

```bash
# Run REST API test with EC2 deployment
make test-rest-memory

# Run gRPC API test with EC2 deployment
make test-grpc-memory

# Run REST API test with Fargate deployment
make test-rest-memory-fargate

# Run gRPC API test with Fargate deployment
make test-grpc-memory-fargate

# Run all tests sequentially
./run-all-tests.sh
```

### Running Tests with Custom Virtual Users

You can modify the number of virtual users by setting the `MAX_VUS` environment variable:

```bash
# Run test with 100 virtual users
K6_MAX_VUS=100 k6 run rest-memory.js

# Run test with 500 virtual users
K6_MAX_VUS=500 k6 run grpc-memory.js

# Run test with 1000 virtual users
K6_MAX_VUS=1000 k6 run rest-memory-fargate.js
```

## Architecture

### Test Scripts

- **REST API Tests**:
  - `rest-memory.js`: Tests REST API on EC2
  - `rest-memory-fargate.js`: Tests REST API on Fargate

- **gRPC API Tests**:
  - `grpc-memory.js`: Tests gRPC API on EC2
  - `grpc-memory-fargate.js`: Tests gRPC API on Fargate

- **Protocol Buffer Definition**:
  - `k6-memory.proto`: Defines the gRPC service and message types

### Report Structure

Test results are saved as HTML reports in the following directories:
- EC2 reports: `reports/ec2/`
- Fargate reports: `reports/fargate/`

### Load Testing Profiles

Each script supports different load testing profiles:
- **100 VUs**: Gentle ramp-up to 100 virtual users with sustained load
- **500 VUs**: Medium load profile with up to 500 virtual users
- **1000 VUs**: High load profile with up to 1000 virtual users

### Metrics Collection

The tests collect the following metrics:
- Response time (ms)
- Success/failure rates
- Request counts
- Response size (bytes)

## Development Guidelines

When modifying the test scripts:

1. Update server endpoints in the respective scripts if testing new deployments.
2. Maintain the same metrics collection across all tests for consistent comparison.
3. Keep load profiles synchronized between REST and gRPC tests for fair comparison.