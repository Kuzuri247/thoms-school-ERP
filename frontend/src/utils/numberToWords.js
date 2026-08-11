/**
 * Shared Number to Words Converter for Indian Currency Format (INR)
 */
export function numberToWordsINR(num) {
  const val = Number(num);
  if (!Number.isFinite(val)) return 'ZERO RUPEES ONLY';

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const a = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const rounded = Math.round(absVal * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let rupeeStr = rupees === 0 ? 'ZERO' : inWords(rupees);
  let rupeeLabel = rupees === 1 ? 'RUPEE' : 'RUPEES';
  let result = (isNegative ? 'MINUS ' : '') + `${rupeeStr} ${rupeeLabel}`;
  if (paise > 0) {
    result += ` AND ${inWords(paise)} PAISE`;
  }
  return result + ' ONLY';
}
