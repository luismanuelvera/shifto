// src/App.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar'; // Install with `npm install react-calendar`

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null); // Store selected date
  const [workDetails, setWorkDetails] = useState([]); // Store work details for all dates
  const [timeRange, setTimeRange] = useState({ start: '', end: '' }); // Store start and end time
  const [dailyRate, setDailyRate] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (event) => {
    const { name, value } = event.target;
    setTimeRange({ ...timeRange, [name]: value });
  };

  const handleDailyRateChange = (event) => {
    setDailyRate(event.target.value);
  };

  const saveWorkDetails = () => {
    if (selectedDate && timeRange.start && timeRange.end && dailyRate) {
      const start = new Date(`${selectedDate.toDateString()} ${timeRange.start}`);
      const end = new Date(`${selectedDate.toDateString()} ${timeRange.end}`);

      if (start < end) {
        const hoursWorked = (end - start) / (1000 * 60 * 60);
        const newEntry = {
          date: selectedDate.toDateString(),
          start: timeRange.start,
          end: timeRange.end,
          hours: hoursWorked,
          rate: parseFloat(dailyRate),
          earnings: hoursWorked * parseFloat(dailyRate),
        };

        setWorkDetails([...workDetails, newEntry]);
      } else {
        alert('End time must be after start time.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  const calculateTotalEarnings = () => {
    return workDetails.reduce((total, entry) => total + entry.earnings, 0);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Income Tracker</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Select a Date:</h2>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
        />
      </div>

      {selectedDate && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Enter Work Details for {selectedDate.toDateString()}:</h2>
          <div>
            <label>Start Time:</label>
            <input
              type="time"
              name="start"
              value={timeRange.start}
              onChange={handleTimeChange}
              style={{ padding: '5px', fontSize: '16px', marginRight: '10px' }}
            />
            <label>End Time:</label>
            <input
              type="time"
              name="end"
              value={timeRange.end}
              onChange={handleTimeChange}
              style={{ padding: '5px', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Hourly Rate:</label>
            <input
              type="number"
              placeholder="Hourly Rate"
              value={dailyRate}
              onChange={handleDailyRateChange}
              style={{ padding: '5px', fontSize: '16px', marginLeft: '10px' }}
            />
          </div>
          <button
            onClick={saveWorkDetails}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Save Work Details
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h2>Total Earnings:</h2>
        <p>${calculateTotalEarnings().toFixed(2)}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Work Hours Summary:</h2>
        <ul>
          {workDetails.map((entry, index) => (
            <li key={index}>
              {entry.date}: {entry.start} - {entry.end}, {entry.hours.toFixed(2)} hours @ ${entry.rate.toFixed(2)} / hour, Earnings: ${entry.earnings.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
