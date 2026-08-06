export default function AppreciationBadge({ history, currentPrice }) {
    if (!history || history.length === 0) {
        return null;
    }

    const oldestSale = history.reduce((oldest, current) => new Date(current.soldAt) < new Date(oldest.soldAt) ? current : oldest);

    if (!oldestSale || oldestSale.soldPrice >= currentPrice) {
        return null;
    }

    const years = (new Date().getTime() - new Date(oldestSale.soldAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    let growthRate = 0;
    let label = "";

    if (years < 1) {
        // Just simple growth if less than a year
        growthRate = ((currentPrice - oldestSale.soldPrice) / oldestSale.soldPrice) * 100;
        label = "Property Value Growth";
    } else {
        // CAGR if more than a year
        growthRate = (Math.pow((currentPrice / oldestSale.soldPrice), (1 / years)) - 1) * 100;
        label = "Property Value Growth (CAGR)";
    }

    if (growthRate <= 0 || !isFinite(growthRate)) return null;

    return (
        <div className="appreciation-badge positive">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
            <span>+{growthRate.toFixed(1)}% {label}</span>
        </div>
    );
}
