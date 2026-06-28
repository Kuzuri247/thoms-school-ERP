import React, { useState } from 'react';
import { Search, User, CreditCard, Banknote, Smartphone, Printer, CheckCircle, Receipt, X } from 'lucide-react';

const CollectFees = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [showReceipt, setShowReceipt] = useState(false);
    
    // Mock data
    const students = [
        { id: '1001', name: 'Alice Walker', class: '10 - A', phone: '123-456-7890' },
        { id: '1002', name: 'Bob Marley', class: '9 - B', phone: '098-765-4321' }
    ];

    const feeCart = [
        { id: 1, type: 'Tuition Fee (June)', amount: 5000, fine: 0, discount: 0 },
        { id: 2, type: 'Transport Fee (June)', amount: 1500, fine: 0, discount: 0 },
        { id: 3, type: 'Library Fee (Annual)', amount: 1000, fine: 0, discount: 200 },
    ];

    const subTotal = feeCart.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscount = feeCart.reduce((sum, item) => sum + item.discount, 0);
    const totalFine = feeCart.reduce((sum, item) => sum + item.fine, 0);
    const grandTotal = subTotal + totalFine - totalDiscount;

    const handleSearch = () => {
        // Mock finding a student
        if (searchQuery.length > 0) setSelectedStudent(students[0]);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
            {/* Left Panel: Student Selection & Cart */}
            <div className="w-full md:w-3/5 flex flex-col gap-6">
                
                {/* Search Bar */}
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex items-center gap-4">
                    <div className="relative w-full group">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by Admission No, Name or Phone..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                        />
                    </div>
                    <button onClick={handleSearch} className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm whitespace-nowrap">
                        Find Student
                    </button>
                </div>

                {/* Student Info Card (If Selected) */}
                {selectedStudent && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-3xl shadow-[0_8px_30px_rgba(16,185,129,0.2)] text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold">{selectedStudent.name}</h2>
                                <p className="text-emerald-50 font-medium text-sm mt-0.5">Class {selectedStudent.class} &nbsp;•&nbsp; Adm No: {selectedStudent.id}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors backdrop-blur-sm">
                            Change
                        </button>
                    </div>
                )}

                {/* Fee Cart Items */}
                <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-emerald-600" />
                            Pending Fees Cart
                        </h3>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl">3 Items</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {feeCart.map((item) => (
                            <div key={item.id} className="p-4 m-2 hover:bg-emerald-50/30 rounded-2xl transition-colors border border-slate-100 group flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">{item.type}</h4>
                                    <div className="flex gap-4 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Fine: ₹{item.fine}</span>
                                        <span>Discount: ₹{item.discount}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-extrabold text-slate-800 text-lg">₹{item.amount.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: POS Payment Terminal */}
            <div className="w-full md:w-2/5 flex flex-col">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 flex flex-col h-full">
                    <h3 className="font-bold text-slate-800 text-xl mb-6">Payment Summary</h3>
                    
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span className="text-slate-800">₹{subTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Fine (+)</span>
                            <span className="text-red-600">₹{totalFine.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 pb-4 border-b border-slate-100">
                            <span>Discount (-)</span>
                            <span className="text-emerald-600">₹{totalDiscount.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-end pt-2">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Payable</span>
                            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Mode</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setPaymentMode('Cash')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMode === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                            >
                                <Banknote className="w-6 h-6" /> Cash
                            </button>
                            <button 
                                onClick={() => setPaymentMode('Card')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMode === 'Card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                            >
                                <CreditCard className="w-6 h-6" /> Card
                            </button>
                            <button 
                                onClick={() => setPaymentMode('UPI')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMode === 'UPI' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                            >
                                <Smartphone className="w-6 h-6" /> UPI / App
                            </button>
                            <button 
                                onClick={() => setPaymentMode('Cheque')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${paymentMode === 'Cheque' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                            >
                                <CheckCircle className="w-6 h-6" /> Cheque
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="p-4 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl transition-colors shrink-0">
                            <Printer className="w-6 h-6" />
                        </button>
                        <button onClick={() => setShowReceipt(true)} className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none" disabled={!selectedStudent}>
                            Process Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Receipt Modal Overlay */}
            {showReceipt && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800">Payment Success</h3>
                            <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Thermal Receipt Body */}
                        <div className="p-6 overflow-y-auto bg-[#fafafa] font-mono text-slate-700">
                            <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-6">
                                <h2 className="font-bold text-xl uppercase tracking-widest text-slate-900">Thomson School</h2>
                                <p className="text-xs mt-1 text-slate-500">123 Education Lane, NY</p>
                                <p className="text-xs text-slate-500">Phone: (555) 123-4567</p>
                                <div className="mt-4 font-bold text-lg bg-slate-200/50 py-1 rounded">FEE RECEIPT</div>
                            </div>
                            
                            <div className="text-xs space-y-1 mb-6 border-b-2 border-dashed border-slate-300 pb-6">
                                <p className="flex justify-between"><span>Date:</span> <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span></p>
                                <p className="flex justify-between"><span>Receipt No:</span> <span>#RCPT-80124</span></p>
                                <p className="flex justify-between mt-2 pt-2 border-t border-dashed border-slate-300"><span>Name:</span> <span className="font-bold">{selectedStudent?.name}</span></p>
                                <p className="flex justify-between"><span>Adm No:</span> <span>{selectedStudent?.id}</span></p>
                                <p className="flex justify-between"><span>Class:</span> <span>{selectedStudent?.class}</span></p>
                            </div>

                            <div className="text-xs mb-6 border-b-2 border-dashed border-slate-300 pb-6">
                                <div className="flex justify-between font-bold mb-2 pb-2 border-b border-dashed border-slate-300 text-slate-900">
                                    <span>Description</span>
                                    <span>Amount</span>
                                </div>
                                {feeCart.map(item => (
                                    <div key={item.id} className="flex justify-between mb-1">
                                        <span>{item.type}</span>
                                        <span>{item.amount}</span>
                                    </div>
                                ))}
                                {(totalFine > 0 || totalDiscount > 0) && (
                                    <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                                        {totalFine > 0 && <div className="flex justify-between"><span>Fine</span><span>{totalFine}</span></div>}
                                        {totalDiscount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{totalDiscount}</span></div>}
                                    </div>
                                )}
                            </div>

                            <div className="text-sm border-b-2 border-dashed border-slate-300 pb-6 mb-6">
                                <div className="flex justify-between font-extrabold text-lg text-slate-900">
                                    <span>TOTAL</span>
                                    <span>₹{grandTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                                    <span>Payment Mode</span>
                                    <span className="uppercase">{paymentMode}</span>
                                </div>
                            </div>

                            <div className="text-center text-xs">
                                <p className="font-bold mb-1">* Keep this receipt for your records *</p>
                                <p className="text-slate-500">Thank you for your payment!</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                            <button onClick={() => setShowReceipt(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                            <button onClick={() => window.print()} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition-colors">
                                <Printer className="w-4 h-4" /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectFees;
