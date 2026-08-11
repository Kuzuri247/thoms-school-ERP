require('dotenv').config({ path: 'backend/.env' });
const { numberToWordsINR: backendConverter } = require('../modules/payments/receipt.service');

console.log('Testing numberToWordsINR function...');

console.log('1 (singular):', backendConverter(1)); // Expected: ONE RUPEE ONLY
console.log('0 (zero):', backendConverter(0)); // Expected: ZERO RUPEES ONLY
console.log('100 (plural):', backendConverter(100)); // Expected: ONE HUNDRED RUPEES ONLY
console.log('-50 (negative):', backendConverter(-50)); // Expected: MINUS FIFTY RUPEES ONLY
console.log('NaN (non-finite):', backendConverter(NaN)); // Expected: ZERO RUPEES ONLY
console.log('Infinity (non-finite):', backendConverter(Infinity)); // Expected: ZERO RUPEES ONLY
console.log('1.50 (with paise):', backendConverter(1.50)); // Expected: ONE RUPEE AND FIFTY PAISE ONLY

if (
  backendConverter(1) === 'ONE RUPEE ONLY' &&
  backendConverter(0) === 'ZERO RUPEES ONLY' &&
  backendConverter(100) === 'ONE HUNDRED RUPEES ONLY' &&
  backendConverter(-50) === 'MINUS FIFTY RUPEES ONLY' &&
  backendConverter(NaN) === 'ZERO RUPEES ONLY' &&
  backendConverter(Infinity) === 'ZERO RUPEES ONLY' &&
  backendConverter(1.50) === 'ONE RUPEE AND FIFTY PAISE ONLY'
) {
  console.log('\n✅ ALL NUMBER-TO-WORDS UNIT TESTS PASSED!');
} else {
  console.error('\n❌ NUMBER-TO-WORDS UNIT TEST FAILED!');
  process.exit(1);
}
