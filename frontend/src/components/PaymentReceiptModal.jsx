import React from 'react';
import { X, Printer } from 'lucide-react';

function numberToWords(num) {
  const val = Number(num);
  if (!val || isNaN(val)) return 'ZERO ONLY';
  const a = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  return (inWords(Math.floor(val)) + ' RUPEES ONLY').toUpperCase();
}

const PaymentReceiptModal = ({ receiptData, onClose }) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountNum = Number(receiptData.amount || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 border border-slate-300 printable-receipt-modal my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-lg border border-emerald-200">
              Official Payment Receipt
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Ref: {receiptData.receiptNo || 'REC-1001'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- RECEIPT CANVAS TO PRINT --- */}
        <div className="border border-slate-900 p-4 sm:p-6 bg-white text-black font-sans text-xs space-y-4 printable-area">
          {/* Header Seal & School Title */}
          <div className="text-center space-y-1">
            <div className="w-16 h-16 rounded-full border border-slate-200 mx-auto flex items-center justify-center bg-white p-1">
              <img src="/st_thomas_logo.png" alt="St. Thomas International School Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wide text-black uppercase font-serif">
              ST. THOMAS INTERNATIONAL SCHOOL
            </h1>
            <h2 className="text-xs font-black text-black tracking-widest uppercase">
              VARANASI
            </h2>
          </div>

          {/* Table Outline Box */}
          <div className="border-2 border-black overflow-hidden">
            {/* Header Banner */}
            <div className="bg-slate-100 border-b-2 border-black text-center font-black text-xs sm:text-sm py-1.5 uppercase tracking-wider text-black">
              PAYMENT RECEIPT (PROVISIONAL)
            </div>

            {/* Grid Table */}
            <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
              <tbody className="divide-y divide-black font-semibold text-black">
                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase w-1/3 border-r border-black">ROLL NUMBER</td>
                  <td className="py-2 px-3 font-mono font-bold">{receiptData.rollNo || receiptData.admissionNo || receiptData.studentId || '2412298'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">STUDENT NAME</td>
                  <td className="py-2 px-3 font-bold uppercase">{receiptData.studentName || 'ADITYA VERMA'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">FATHER NAME</td>
                  <td className="py-2 px-3 font-bold uppercase">{receiptData.fatherName || 'PRAKASH VERMA'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">CLASS</td>
                  <td className="py-2 px-3 font-bold uppercase">{receiptData.className || receiptData.class || 'XII'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">MODE OF PAYMENT</td>
                  <td className="py-2 px-3 font-bold uppercase">{receiptData.paymentMode || 'UPI'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">TRANSACTION ID</td>
                  <td className="py-2 px-3 font-mono font-bold">{receiptData.receiptNo || receiptData.transactionId || '99117'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">GATEWAY TRANSACTION ID</td>
                  <td className="py-2 px-3 font-mono uppercase">{receiptData.gatewayTxnId || receiptData.razorpayPaymentId || 'BHDF7GN0OKUUDS'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">BANK REFERENCE NO</td>
                  <td className="py-2 px-3 font-mono">{receiptData.bankRefNo || '2517787977083'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">DATE OF TRANSACTION</td>
                  <td className="py-2 px-3 font-mono font-bold">{receiptData.date || '29-07-2026'} {receiptData.time || '16:38:09'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">FEE</td>
                  <td className="py-2 px-3 font-bold">Rs. {amountNum.toLocaleString()}/-</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">FINE</td>
                  <td className="py-2 px-3 font-bold">Rs. 0/-</td>
                </tr>

                <tr className="border-b border-black bg-slate-50">
                  <td className="py-2 px-3 font-black uppercase border-r border-black">TOTAL AMOUNT</td>
                  <td className="py-2 px-3 font-black">Rs. {amountNum.toLocaleString()}/-</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">AMOUNT IN WORDS</td>
                  <td className="py-2 px-3 font-bold uppercase">{numberToWords(amountNum)}</td>
                </tr>

                <tr>
                  <td className="py-2 px-3 font-bold uppercase border-r border-black">TRANSACTION TYPE</td>
                  <td className="py-2 px-3 font-bold uppercase">{receiptData.feeType?.toUpperCase() || 'ONLINE TUITION FEE'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Centered Print Button Box */}
          <div className="text-center py-2 no-print">
            <button
              onClick={handlePrint}
              className="px-6 py-2 border border-black hover:bg-slate-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-none cursor-pointer"
            >
              PRINT
            </button>
          </div>

          {/* Footer Contact Details */}
          <div className="text-center text-[10.5px] sm:text-xs font-semibold space-y-1 text-slate-900 border-t border-slate-300 pt-3">
            <p>Campus: Munari Road, Damodarpur, Sarnath, Varanasi - 221112</p>
            <p>Phones: 9839009324, 6386752450, 6386752469</p>
            <p>City Office : St. Thomas International School, 4th Floor, Vinayak Tower, Paharia Crossing, Varanasi – 221001, Phone: 8400277770</p>
            <p>E-mail: stis.varanasi@gmail.com</p>
            <p>Website: www.stisvn.com</p>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-dashed border-slate-400 pt-3 text-[10px] sm:text-[11px] font-semibold text-slate-800 space-y-0.5">
            <p className="font-bold">Please Note :</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>This is computer generated receipt hence no signature is required.</li>
              <li>This receipt is valid subject to realisation of funds in the school's bank account.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-receipt-modal, .printable-receipt-modal * {
            visibility: visible !important;
          }
          .printable-receipt-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .printable-area {
            border: 2px solid black !important;
            padding: 15px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentReceiptModal;
