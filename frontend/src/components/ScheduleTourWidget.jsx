import { useState } from 'react';
import { FaCalendarAlt, FaVideo, FaUserCheck, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './ScheduleTourWidget.css';

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
  '05:30 PM',
];

export default function ScheduleTourWidget({ propertyTitle = 'Property' }) {
  const [tourType, setTourType] = useState('in_person');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState('11:30 AM');
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 6 days
  const days = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      weekday: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.toDateString(),
    };
  });

  const handleBookTour = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setBooked(true);
      toast.success(`Tour request submitted for ${days[selectedDayIdx].date} at ${selectedTime}!`);
    }, 600);
  };

  return (
    <div className="z-tour-widget">
      <div className="z-tour-widget__header">
        <h3 className="z-tour-widget__title">Schedule a Tour</h3>
        <p className="z-tour-widget__subtitle">Choose your preferred tour type and time slot</p>
      </div>

      {booked ? (
        <div className="z-tour-booked">
          <FaCheckCircle className="z-tour-booked__icon" />
          <h4>Tour Requested!</h4>
          <p>
            An agent will confirm your <strong>{tourType === 'in_person' ? 'In-Person' : 'Live Video'}</strong> tour for <strong>{days[selectedDayIdx].fullDate}</strong> at <strong>{selectedTime}</strong>.
          </p>
          <button className="btn btn-outline btn-sm mt-md" onClick={() => setBooked(false)}>
            Change Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleBookTour}>
          
          {/* Tour Type Selector */}
          <div className="z-tour-type-switcher">
            <button
              type="button"
              className={`z-tour-type-btn ${tourType === 'in_person' ? 'active' : ''}`}
              onClick={() => setTourType('in_person')}
            >
              <FaUserCheck /> In-Person
            </button>
            <button
              type="button"
              className={`z-tour-type-btn ${tourType === 'video' ? 'active' : ''}`}
              onClick={() => setTourType('video')}
            >
              <FaVideo /> Live Video
            </button>
          </div>

          {/* Days Carousel */}
          <div className="z-tour-days">
            {days.map((day, idx) => (
              <button
                key={idx}
                type="button"
                className={`z-tour-day-card ${selectedDayIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedDayIdx(idx)}
              >
                <span className="z-tour-day-weekday">{day.weekday}</span>
                <strong className="z-tour-day-date">{day.date}</strong>
              </button>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="z-tour-times">
            <label className="form-label" style={{ marginBottom: '6px' }}>Select a Time Slot</label>
            <div className="z-tour-times-grid">
              {TIME_SLOTS.map((time, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`z-tour-time-pill ${selectedTime === time ? 'active' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  <FaClock size={11} /> {time}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full z-tour-submit-btn" disabled={submitting}>
            {submitting ? 'Requesting...' : `Request ${tourType === 'in_person' ? 'In-Person' : 'Video'} Tour`}
          </button>
          <small className="z-tour-disclaimer">Free cancellation. No commitment required.</small>
        </form>
      )}
    </div>
  );
}
