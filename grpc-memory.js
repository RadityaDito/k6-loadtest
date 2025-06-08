import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Create a gRPC client (init context)
const client = new grpc.Client({
  timeout: '10s',
  plaintext: true,
  reflect: false
});

// Load proto file (MUST be in init context)
client.load(['./'], 'k6-memory.proto');

// Custom Metrics
let successRate = new Rate('success_rate');
let failureRate = new Rate('failures');
let requestsCount = new Counter('requests');
let responseTime = new Trend('response_time');
let responseSize = new Trend('response_size');

// Choose your load test profile by setting MAX_VUS environment variable
const MAX_VUS = __ENV.MAX_VUS || '100';

let testStages;
switch(MAX_VUS) {
  case '100':
    testStages = [
      { duration: '5s', target: 25 },
      { duration: '10s', target: 50 },
      { duration: '20s', target: 100 },
      { duration: '40s', target: 100 },
      { duration: '5s', target: 0 },
    ];
    break;
  case '500':
    testStages = [
      { duration: '10s', target: 50 },
      { duration: '15s', target: 250 },
      { duration: '20s', target: 500 },
      { duration: '40s', target: 500 },
      { duration: '10s', target: 0 },
    ];
    break;
  case '1000':
  default:
    testStages = [
      { duration: '10s', target: 100 },
      { duration: '20s', target: 500 },
      { duration: '20s', target: 1000 },
      { duration: '40s', target: 1000 },
      { duration: '10s', target: 0 },
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

// Track connected VUs to avoid reconnecting
const connectedVUs = {};

export default () => {
  // Connect once per VU (MUST be in default function)
  const vuId = __VU;
  if (!connectedVUs[vuId]) {
    client.connect('47.129.237.24:6000', { plaintext: true });
    connectedVUs[vuId] = true;
  }

  const data = {};
  let start = new Date().getTime();

  try {
    const response = client.invoke('memory.v1.MemoryProductService/GetAllProducts', data);

    let duration = new Date().getTime() - start;
    responseTime.add(duration);

    const isStatusOk = check(response, {
      'status is OK': (r) => r && r.status === grpc.StatusOK,
    });

    if (!isStatusOk && response) {
      console.log(`gRPC error: Status=${response.status}, Message=${response.error}`);
    }

    // Measure response size
    if (response && response.message) {
      const sizeInBytes = JSON.stringify(response.message).length;
      responseSize.add(sizeInBytes);
    }

    successRate.add(!!isStatusOk);
    failureRate.add(!isStatusOk);
  } catch (error) {
    console.log(`Exception: ${error}`);
    failureRate.add(1);
    successRate.add(0);
  }

  requestsCount.add(1);
  sleep(1);
};