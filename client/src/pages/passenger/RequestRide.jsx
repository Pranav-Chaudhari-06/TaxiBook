import RideRequestForm from '../../components/passenger/RideRequestForm';

const RequestRide = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Request a Ride</h1>
      <div className="card">
        <RideRequestForm />
      </div>
    </div>
  );
};

export default RequestRide;
