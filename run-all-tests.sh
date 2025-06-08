#!/bin/bash

# K6 Test Automation Script
# Runs 4 tests sequentially using Makefile commands

echo "Starting K6 test automation..."
echo "================================"

# Test 1: rest-memory
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Test 1: rest-memory"
make test-rest-memory
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Test 1 completed"
echo "--------------------------------"

# Test 2: grpc-memory
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Test 2: grpc-memory"
make test-grpc-memory
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Test 2 completed"
echo "--------------------------------"

# # Test 3: grpc-memory-fargate
# echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Test 3: grpc-memory-fargate"
# make test-grpc-memory-fargate
# echo "[$(date '+%Y-%m-%d %H:%M:%S')] Test 3 completed"
# echo "--------------------------------"

# # Test 4: rest-memory-fargate
# echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Test 4: rest-memory-fargate"
# make test-rest-memory-fargate
# echo "[$(date '+%Y-%m-%d %H:%M:%S')] Test 4 completed"
# echo "================================"

echo "All tests completed!"