import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Create a gRPC client
const client = new grpc.Client({
  timeout: '10s',
  plaintext: true,
  reflect: false
});

client.load(['./'], 'k6-memory.proto');

// Custom Metrics
let successRate = new Rate('success_rate');
let failureRate = new Rate('failures');
let requestsCount = new Counter('requests');
let responseTime = new Trend('response_time');
let responseSize = new Trend('response_size'); // NEW: to track size in bytes

// Choose your load test profile by setting MAX_VUS environment variable
// Example: K6_MAX_VUS=500 k6 run grpc-memory.js
const MAX_VUS = __ENV.MAX_VUS || '100';

let testStages;
switch(MAX_VUS) {
  case '100':
    testStages = [
      { duration: '5s', target: 25 },   // Gentle start
      { duration: '10s', target: 50 },  // Ramp to 50
      { duration: '20s', target: 100 }, // Ramp to 100
      // { duration: '280s', target: 100 }, // Sustained load
      { duration: '40s', target: 100 }, // Sustained load
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
      // { duration: '280s', target: 1000 }, // Longer sustained load
      { duration: '40s', target: 1000 }, // Longer sustained load
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



// Use this corrected version
const connectedVUs = {};

export default () => {
   const vuId = __VU;
  
  if (!connectedVUs[vuId]) {
    // client.connect('47.129.237.24:6000', { plaintext: true });
    client.connect('10.0.1.185:6000', { plaintext: true });
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

    // Ensure boolean values for Rate metrics
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

// import grpc from 'k6/net/grpc';
// import { check, sleep } from 'k6';
// import { Trend, Rate, Counter } from 'k6/metrics';

// // Create a gRPC client
// const client = new grpc.Client({
//   timeout: '10s',
//   plaintext: true,
//   reflect: false
// });

// client.load(['./'], 'k6-memory.proto');

// // Custom Metrics
// let successRate = new Rate('success_rate');
// let failureRate = new Rate('failures');
// let requestsCount = new Counter('requests');
// let responseTime = new Trend('response_time');
// let responseSize = new Trend('response_size'); // NEW: to track size in bytes

// // Choose your load test profile by setting MAX_VUS environment variable
// // Example: K6_MAX_VUS=500 k6 run grpc-memory.js
// const MAX_VUS = __ENV.MAX_VUS || '100';

// let testStages;
// switch(MAX_VUS) {
//   case '100':
//     testStages = [
//       { duration: '5s', target: 25 },   // Gentle start
//       { duration: '10s', target: 50 },  // Ramp to 50
//       { duration: '20s', target: 100 }, // Ramp to 100
//       // { duration: '280s', target: 100 }, // Sustained load
//       { duration: '40s', target: 100 }, // Sustained load
//       { duration: '5s', target: 0 },    // Ramp down
//     ];
//     break;
//   case '500':
//     testStages = [
//       { duration: '10s', target: 50 },   // Gentle start
//       { duration: '15s', target: 250 },  // Ramp to 250
//       { duration: '20s', target: 500 },  // Ramp to 500
//       { duration: '40s', target: 500 },  // Sustained load
//       { duration: '10s', target: 0 },    // Ramp down
//     ];
//     break;
//   case '1000':
//   default:
//     testStages = [
//       { duration: '10s', target: 100 },  // Slower ramp to 100
//       { duration: '20s', target: 500 },  // Slower ramp to 500  
//       { duration: '20s', target: 1000 }, // Slower ramp to 1000
//       // { duration: '280s', target: 1000 }, // Longer sustained load
//       { duration: '40s', target: 1000 }, // Longer sustained load
//       { duration: '10s', target: 0 },    // Graceful ramp down
//     ];
//     break;
// }

// export let options = {
//   stages: testStages,
//   discardResponseBodies: false,
//   thresholds: {
//     'success_rate': ['rate>=0.95']
//   }
// };

// export default () => {
//   const vuId = __VU;
  
//   client.connect('47.129.237.24:6000', { plaintext: true });
  
//   const data = {};
//   let start = new Date().getTime();

//   try {
//     const response = client.invoke('memory.v1.MemoryProductService/GetAllProducts', data);

//     let duration = new Date().getTime() - start;
//     responseTime.add(duration);

//     const isStatusOk = check(response, {
//       'status is OK': (r) => r && r.status === grpc.StatusOK,
//     });

//     if (!isStatusOk && response) {
//       console.log(`gRPC error: Status=${response.status}, Message=${response.error}`);
//     }

//     // Measure response size
//     if (response && response.message) {
//       const sizeInBytes = JSON.stringify(response.message).length;
//       responseSize.add(sizeInBytes);
//     }

//     // Ensure boolean values for Rate metrics
//     successRate.add(!!isStatusOk);
//     failureRate.add(!isStatusOk);
//   } catch (error) {
//     console.log(`Exception: ${error}`);
//     failureRate.add(1);
//     successRate.add(0);
//   }

//   requestsCount.add(1);
  
//   client.close();
  
//   sleep(1);
// };