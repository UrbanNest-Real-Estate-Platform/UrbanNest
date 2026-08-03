import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function AuctionReminder({ property }) {
    const [reminded, setReminded] = useState(false);

    const handleRemindMe = () => {
        setReminded(true);
        toast.success("You will be notified 1 hour before the auction starts!");
    };

    return (
        <div className="auction-reminder">
            <div className="ar-title">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4M12 14v-4M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>
                Upcoming Live Auction
            </div>
            <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#b45309' }}>Starts in approx. 2 hours</p>
            {reminded ? (
                <button className="ar-btn" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }} disabled>
                    Reminder Set
                </button>
            ) : (
                <button className="ar-btn" onClick={handleRemindMe}>
                    Remind Me
                </button>
            )}
        </div>
    );
}
