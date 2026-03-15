import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetBookingQuery, useCreatePaymentMutation, useGetPaymentByBookingQuery } from '../../features/rides/ridesApi';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatDate';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const MakePayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useGetBookingQuery(bookingId);
  const { data: existingPayment } = useGetPaymentByBookingQuery(bookingId);
  const [createPayment, { isLoading: paying }] = useCreatePaymentMutation();
  const [transactionId, setTransactionId] = useState('');

  if (isLoading) return <Loader />;

  if (existingPayment) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 animate-slide-up">
        <div className="card text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="section-title text-center">Payment Already Made</h2>
          <p className="text-surface-400">Transaction ID: {existingPayment.transactionId}</p>
          <p className="text-surface-400">Amount: {formatCurrency(existingPayment.amount)}</p>
          <button onClick={() => navigate(`/passenger/feedback/${bookingId}`)} className="btn-primary mt-4">
            Leave Feedback
          </button>
        </div>
      </div>
    );
  }

  const amount = booking?.interest?.estimatedCost;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error('Enter a transaction ID');
      return;
    }
    try {
      await createPayment({ bookingId, transactionId }).unwrap();
      toast.success('Payment recorded!');
      navigate(`/passenger/feedback/${bookingId}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 animate-slide-up">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="section-title text-center">Make Payment</h2>
          <p className="text-3xl font-bold text-primary-600 mt-2">{formatCurrency(amount)}</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="label">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="input-field"
              placeholder="Enter your transaction/reference ID"
            />
          </div>

          <button type="submit" disabled={paying} className="btn-primary w-full">
            {paying ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakePayment;
