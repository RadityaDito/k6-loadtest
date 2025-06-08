#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory if it doesn't exist
mkdir -p reports/fargate

# Get timestamp for unique report names
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to run a test and log the output
run_test() {
    local script_file=$1
    local vu_count=$2
    local test_type=$3
    
    # Generate unique report filename
    local report_file="reports/fargate/${test_type}_${vu_count}vu_${TIMESTAMP}.html"
    
    echo -e "${YELLOW}Running $test_type test with $vu_count VUs...${NC}"
    
    # Run k6 directly without using Makefile
    K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$report_file MAX_VUS=$vu_count k6 run $script_file
    
    echo -e "${GREEN}Completed $test_type test with $vu_count VUs${NC}"
    echo -e "Report saved to: ${BLUE}$report_file${NC}"
    echo ""
}

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}     Running Fargate Load Tests with k6       ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Run REST tests with different VU counts
echo -e "${BLUE}Starting REST API Tests${NC}"
run_test "rest-memory-fargate.js" "100" "REST"
run_test "rest-memory-fargate.js" "500" "REST"
run_test "rest-memory-fargate.js" "1000" "REST"

# Run gRPC tests with different VU counts
echo -e "${BLUE}Starting gRPC API Tests${NC}"
run_test "grpc-memory-fargate.js" "100" "gRPC"
run_test "grpc-memory-fargate.js" "500" "gRPC"
run_test "grpc-memory-fargate.js" "1000" "gRPC"

echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "Reports are available in the ${BLUE}reports/fargate/${NC} directory"