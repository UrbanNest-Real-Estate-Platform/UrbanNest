import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AuctionReminder({ property }) {
    const [reminded, setReminded] = useState(false);
    const [now, setNow] = useState(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const startTime = property.auctionStartTime ? new Date(property.auctionStartTime).getTime() : 0;
    const endTime = property.auctionEndTime ? new Date(property.auctionEndTime).getTime() : 0;

    const isFuture = startTime > now;
    const isOngoing = startTime <= now && endTime > now;

    const formatCountdown = (targetMs) => {
        const diff = targetMs - now;
        if (diff <= 0) return '00h 00m 00s';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    };

    const handleRemindMe = () => {
        setReminded(true);
        toast.success("You will be notified 1 hour before the auction starts!");
    };

    let timeDisplay, timeLabel, badgeStyle, badgeIcon;
    if (isFuture) {
        const diffHrs = (startTime - now) / 3600000;
        timeLabel = "Upcoming Live Auction";
        badgeIcon = <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4M12 14v-4M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>;
        if (diffHrs <= 24) {
            timeDisplay = "Starts in " + formatCountdown(startTime);
        } else {
            timeDisplay = "Starts on " + new Date(startTime).toLocaleDateString() + ' ' + new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        badgeStyle = { color: '#b45309' };
    } else if (isOngoing) {
        timeLabel = "Live Auction Ongoing";
        badgeIcon = <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'red', marginRight: 8 }} />;
        timeDisplay = "Ends in " + formatCountdown(endTime);
        badgeStyle = { color: '#dc2626' };
    } else {
        timeLabel = "Auction Ended";
        badgeIcon = <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>;
        timeDisplay = "This auction has concluded.";
        badgeStyle = { color: '#6b7280' };
    }

    return (
        <div className="auction-reminder">
            <div className="ar-title">
                {badgeIcon}
                {timeLabel}
            </div>
            <p style={{ margin: '8px 0', fontSize: '0.9rem', ...badgeStyle }}>{timeDisplay}</p>
            {isFuture ? (
                reminded ? (
                    <button className="ar-btn" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }} disabled>
                        Reminder Set
                    </button>
                ) : (
                    <button className="ar-btn" onClick={handleRemindMe}>
                        Remind Me
                    </button>
                )
            ) : isOngoing ? (
                <button className="pd-btn-primary pd-offer-btn" onClick={() => navigate(`/auction/${property._id || property.id}`)}>
                    Participate
                </button>
            ) : (
                <button className="pd-btn-primary pd-offer-btn" disabled style={{ background: '#f3f4f6', color: '#9ca3af', border: 'none' }}>
                    Auction Ended
                </button>
            )}
        </div>
    );
}
