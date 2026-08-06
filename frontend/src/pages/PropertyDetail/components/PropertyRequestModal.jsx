import { useState } from 'react';
import { submitPropertyRequest } from '../../../services/propertyService';
import { toast } from 'react-toastify';

export default function PropertyRequestModal({ property, isVacancy, onClose }) {
    const [message, setMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const isRent = property.listingType === 'rent';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { message };
            if (isVacancy) {
                payload.isVacancyRequest = true;
            } else if (isRent) {
                if (!startDate || !endDate) {
                    toast.error("Start Date and End Date are required");
                    setLoading(false);
                    return;
                }
                payload.startDate = startDate;
                payload.endDate = endDate;
            }

            const res = await submitPropertyRequest(property._id, payload);
            if (res.data.success) {
                toast.success(res.data.message || "Request submitted successfully");
                onClose();
            }
        } catch (error) {
            console.error("Error submitting request", error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{isVacancy ? 'Submit Vacancy Request' : (isRent ? 'Request Tenancy' : 'Request Ownership Transfer')}</h3>
                
                <form onSubmit={handleSubmit}>
                    {isRent && !isVacancy && (
                        <>
                            <div className="form-group">
                                <label>Start Date <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Message to Owner (Optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a note for the owner..."
                            rows="4"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
