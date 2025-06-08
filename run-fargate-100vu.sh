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
    local test_type=$2
    
    # Generate unique report filename
    local report_file="reports/fargate/${test_type}_100vu_${TIMESTAMP}.html"
    
    echo -e "${YELLOW}Running $test_type test with 100 VUs...${NC}"
    
    # Run k6 with 100 VUs
    K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$report_file MAX_VUS=100 k6 run $script_file
    
    echo -e "${GREEN}Completed $test_type test with 100 VUs${NC}"
    echo -e "Report saved to: ${BLUE}$report_file${NC}"
    echo ""
}

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   Running Fargate Load Tests with 100 VUs    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Run REST test with 100 VUs
echo -e "${BLUE}Starting REST API Test (100 VUs)${NC}"
run_test "rest-memory-fargate.js" "REST"

# Run gRPC test with 100 VUs
echo -e "${BLUE}Starting gRPC API Test (100 VUs)${NC}"
run_test "grpc-memory-fargate.js" "gRPC"

echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "Reports are available in the ${BLUE}reports/fargate/${NC} directory"