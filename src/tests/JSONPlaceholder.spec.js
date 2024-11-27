import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getDuration = new Trend('get_duration', true);
export const statusOKRate = new Rate('status_OK_rate');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    get_duration: ['p(95)<5700'], 
    status_OK_rate: ['rate>0.95'], 
  },
  stages: [
    { duration: '1m', target: 10 }, 
    { duration: '3m', target: 300 }, 
    { duration: '1m', target: 0 }, 
  ],
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

export default function () {
  const baseUrl = 'https://jsonplaceholder.typicode.com/posts';

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const OK = 200;

  const res = http.get(baseUrl, params);

  getDuration.add(res.timings.duration); 
  statusOKRate.add(res.status === OK); 

  check(res, {
    'GET Posts - Status 200': () => res.status === OK,
  });
}
