import { useParams, useNavigate } from 'react-router-dom';
import { useGetFeedbackByBookingQuery } from '../../features/rides/ridesApi';
import FeedbackForm from '../../components/passenger/FeedbackForm';
import { MessageSquare } from 'lucide-react';

const Feedback = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { data: existing } = useGetFeedbackByBookingQuery(bookingId);

  if (existing) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 animate-slide-up">
        <div className="card text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="section-title text-center">Feedback Already Submitted</h2>
          <p className="text-surface-500 italic">"{existing.description}"</p>
          <button onClick={() => navigate('/passenger/bookings')} className="btn-primary mt-4">
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Leave Feedback</h1>
      <div className="card">
        <FeedbackForm bookingId={bookingId} onSuccess={() => navigate('/passenger/bookings')} />
      </div>
    </div>
  );
};

export default Feedback;
