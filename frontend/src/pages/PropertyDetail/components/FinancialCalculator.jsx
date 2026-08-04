import { useState } from 'react';

export default function FinancialCalculator({ property, formatPrice }) {
    if (property.listingType === 'rent') {
        const securityDeposit = property.securityDeposit || 0;
        const maintenance = property.maintenance || 0;

        return (
            <div className="fin-calc">
                <h3>Rent Breakdown</h3>
                <div className="fin-row">
                    <span>Monthly Rent</span>
                    <strong>{formatPrice(property.totalPrice)}</strong>
                </div>
                <div className="fin-row">
                    <span>Maintenance (Monthly)</span>
                    <strong>{formatPrice(maintenance)}</strong>
                </div>
                <div className="fin-row">
                    <span>Security Deposit (Refundable)</span>
                    <strong>{formatPrice(securityDeposit)}</strong>
                </div>
                <div className="fin-divider" />
                <div className="fin-row fin-total">
                    <span>Move-in Total</span>
                    <strong>{formatPrice(property.totalPrice + maintenance + securityDeposit)}</strong>
                </div>
            </div>
        );
    }

    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenureYears, setTenureYears] = useState(20);

    const downPayment = (property.totalPrice * downPaymentPct) / 100;
    const loanAmount = property.totalPrice - downPayment;

    const R = (interestRate / 12) / 100;
    const N = tenureYears * 12;

    let emi = 0;
    if (R > 0 && N > 0) {
        emi = (loanAmount * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    }

    const totalPayment = emi * N;
    const totalInterest = totalPayment - loanAmount;

    return (
        <div className="fin-calc">
            <h3>EMI Calculator</h3>
            <div className="fin-slider-group">
                <div className="fin-label-row">
                    <label>Down Payment ({downPaymentPct}%)</label>
                    <span>{formatPrice(downPayment)}</span>
                </div>
                <input type="range" min="10" max="90" value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} />
            </div>

            <div className="fin-slider-group">
                <div className="fin-label-row">
                    <label>Interest Rate</label>
                    <span>{interestRate}% p.a.</span>
                </div>
                <input type="range" min="5" max="15" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
            </div>

            <div className="fin-slider-group">
                <div className="fin-label-row">
                    <label>Loan Tenure</label>
                    <span>{tenureYears} Years</span>
                </div>
                <input type="range" min="5" max="30" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} />
            </div>

            <div className="fin-result">
                <div className="fin-emi-amt">{formatPrice(Math.round(emi))} <span>/ month</span></div>
                <div className="fin-breakdown">
                    <div>
                        <span className="fin-dot principal"></span> Principal: {formatPrice(Math.round(loanAmount))}
                    </div>
                    <div>
                        <span className="fin-dot interest"></span> Interest: {formatPrice(Math.round(totalInterest))}
                    </div>
                </div>
            </div>
        </div>
    );
}
