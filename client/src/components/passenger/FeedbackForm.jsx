import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateFeedbackMutation } from '../../features/rides/ridesApi';

const FeedbackForm = ({ bookingId, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    try {
      await createFeedback({ bookingId, description }).unwrap();
      toast.success('Feedback submitted!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Your Feedback</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[120px]"
          placeholder="Share your experience..."
        />
      </div>
      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm;
