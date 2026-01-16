
import React, { useState } from 'react';
import Modal from './Modal';

export const WithdrawalModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [withdrawalInfo, setWithdrawalInfo] = useState('');
    const [amount, setAmount] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleWithdraw = () => {
        // Handle withdrawal logic here
        setSubmitted(true);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={submitted ? "Withdrawal Request Received" : "Withdraw Funds"}>
            {submitted ? (
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300 mb-6">Your withdrawal request has been received and will be processed within 24 hours.</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                    >
                        Ok
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700"
                            placeholder="e.g., 100"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Withdrawal Information</label>
                        <textarea
                            value={withdrawalInfo}
                            onChange={(e) => setWithdrawalInfo(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700"
                            placeholder="Enter your BTC address, bank account details, etc."
                        />
                    </div>
                    <button
                        onClick={handleWithdraw}
                        className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                    >
                        Withdraw
                    </button>
                </div>
            )}
        </Modal>
    );
};
