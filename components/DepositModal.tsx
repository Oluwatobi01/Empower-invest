
import React, { useState } from 'react';
import Modal from './Modal';

export const DepositModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const btcAddress = "bc1q7zddqxvqttrffqdqmr8ft96v6zfwtkz6jdlatf";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(btcAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deposit BTC">
            <div className="text-center">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${btcAddress}`}
                    alt="BTC Deposit QR Code"
                    className="mx-auto mb-4 border-4 border-white rounded-lg"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Send BTC to the address below</p>
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-200 break-all">{btcAddress}</span>
                    <button
                        onClick={handleCopy}
                        className="ml-2 px-3 py-1 text-xs font-bold text-white bg-primary rounded hover:bg-blue-600"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
