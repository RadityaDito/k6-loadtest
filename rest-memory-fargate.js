import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom Metrics
let successRate = new Rate('success_rate');
let failureRate = new Rate('failures');
let requestsCount = new Counter('requests');
let responseTime = new Trend('response_time');
let responseSize = new Trend('response_size');

// export let options = {
//   vus: 1000,                // Virtual Users
//   duration: '1m',         // Test duration
//   discardResponseBodies: false,
//   thresholds: {
//     'success_rate': ['rate>=0.95'],  // 95% or more successful requests
//   }
// };

// Choose your load test profile by setting MAX_VUS environment variable
// Example: K6_MAX_VUS=500 k6 run rest-memory-fargate.js
const MAX_VUS = '1000';

let testStages;
switch(MAX_VUS) {
  case '100':
    testStages = [
      { duration: '5s', target: 25 },   // Gentle start
      { duration: '10s', target: 50 },  // Ramp to 50
      { duration: '20s', target: 100 }, // Ramp to 100
      { duration: '280s', target: 100 }, // Sustained load
      { duration: '5s', target: 0 },    // Ramp down
    ];
    break;
  case '500':
    testStages = [
      { duration: '10s', target: 50 },   // Gentle start
      { duration: '15s', target: 250 },  // Ramp to 250
      { duration: '20s', target: 500 },  // Ramp to 500
      { duration: '40s', target: 500 },  // Sustained load
      { duration: '10s', target: 0 },    // Ramp down
    ];
    break;
  case '1000':
  default:
    testStages = [
      { duration: '10s', target: 100 },  // Slower ramp to 100
      { duration: '20s', target: 500 },  // Slower ramp to 500  
      { duration: '20s', target: 1000 }, // Slower ramp to 1000
      { duration: '280s', target: 1000 }, // Longer sustained load
      { duration: '10s', target: 0 },    // Graceful ramp down
    ];
    break;
}

export let options = {
  stages: testStages,
  discardResponseBodies: false,
  thresholds: {
    'success_rate': ['rate>=0.95']
  }
};

export default function () {
  const url = 'http://18.143.186.87:4000/api/v1/memory/products/all';

  // Start timing
  const start = new Date().getTime();

  const res = http.get(url);

  // Stop timing
  const duration = new Date().getTime() - start;
  responseTime.add(duration);

  // Check if request was successful (status 200 AND body exists)
  const isStatusOk = res && res.status === 200 && res.body;

  // Always run check to ensure it's counted in metrics
  check(res, {
    'status is 200': (r) => r && r.status === 200 && r.body,
  });

  // Record size of response body (in bytes) - only if response exists
  if (res && res.body) {
    responseSize.add(res.body.length);
  } else {
    console.log(`Request failed: Status=${res ? res.status : 'timeout'}, Error=${res ? res.error : 'connection timeout'}`);
  }

  // Track metrics - ensure boolean values for Rate metrics
  successRate.add(!!isStatusOk);
  failureRate.add(!isStatusOk);
  requestsCount.add(1);

  // Sleep to simulate think time
  sleep(1);
}