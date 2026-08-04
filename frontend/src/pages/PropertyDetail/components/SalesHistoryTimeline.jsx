import React from 'react';

export default function SalesHistoryTimeline({ history }) {
    if (!history || history.length === 0) return <p>No history available.</p>;

    // Sort descending by date
    const sortedHistory = [...history].sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt));

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const formatPrice = (price) => {
        if (price >= 10000000) {
            return '₹' + (price / 10000000).toFixed(2) + ' Cr';
        } else if (price >= 100000) {
            return '₹' + (price / 100000).toFixed(2) + ' L';
        }
        return '₹' + price.toString();
    };


    return (
        <div className="timeline">
            {sortedHistory.map((item, idx) => (
                <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                        <div className="tc-header">
                            <span>Sold</span>
                            <span>{formatDate(item.soldAt)}</span>
                        </div>
                        <div className="tc-price">{formatPrice(item.soldPrice)}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                            Transaction recorded on platform
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
