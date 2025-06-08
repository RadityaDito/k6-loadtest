#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory if it doesn't exist
mkdir -p reports/ec2

# Get timestamp for unique report names
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to run a test and log the output
run_test() {
    local vu_count=$1
    
    # Generate unique report filename
    local report_file="reports/ec2/gRPC_EC2_${vu_count}vu_${TIMESTAMP}.html"
    
    echo -e "${YELLOW}Running gRPC EC2 test with $vu_count VUs...${NC}"
    
    # Run k6 directly without using Makefile
    K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=$report_file MAX_VUS=$vu_count k6 run grpc-memory.js
    
    echo -e "${GREEN}Completed gRPC EC2 test with $vu_count VUs${NC}"
    echo -e "Report saved to: ${BLUE}$report_file${NC}"
    echo ""
}

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      Running gRPC EC2 Load Tests with k6      ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Run gRPC EC2 tests with different VU counts
echo -e "${BLUE}Starting gRPC EC2 API Tests${NC}"
run_test "100"
run_test "500"
run_test "1000"

echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "Reports are available in the ${BLUE}reports/ec2/${NC} directory"