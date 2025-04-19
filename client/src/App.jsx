import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [daysOfWeek] = useState([
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' },
  ]);
  const [airports, setAirports] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch the list of airports from the API
    fetch('http://localhost:5000/airports')
      .then((response) => response.json())
      .then((data) => setAirports(data))
      .catch((error) => console.error('Error fetching airports:', error));
  }, []);

  const handleSubmit = () => {
    if (!selectedDay || !selectedAirport) {
      alert('Please select both a day and an airport.');
      return;
    }

    const [originAirportId, destAirportId] = selectedAirport.split(',');

    // Call the API to get the delay chances
    fetch(
      `http://localhost:5000/predict_delay?day_of_month=${selectedDay}&origin_airport_id=${originAirportId}&dest_airport_id=${destAirportId}`
    )
      .then((response) => response.json())
      .then((data) => setResult(data))
      .catch((error) => console.error('Error fetching delay chances:', error));
  };

  return (
    <div className="App">
      <h1>Flight Delay Predictor</h1>
      <div>
        <label htmlFor="day-select">Select Day of the Week:</label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="">--Select a Day--</option>
          {daysOfWeek.map((day) => (
            <option key={day.id} value={day.id}>
              {day.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="airport-select">Select Airport:</label>
        <select
          id="airport-select"
          value={selectedAirport}
          onChange={(e) => setSelectedAirport(e.target.value)}
        >
          <option value="">--Select an Airport--</option>
          {airports.map((airport) => (
            <option
              key={airport.OriginAirportID}
              value={`${airport.OriginAirportID},${airport.DestAirportID}`}
            >
              {airport.OriginAirportName}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSubmit}>Get Delay Chances</button>
      {result && (
        <div>
          <h2>Results:</h2>
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <p>
              Delay Chance: {result.delay_chance}% <br />
              Confidence: {result.confidence}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;