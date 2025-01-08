import React, { useState } from "react";
import Calendar from "react-calendar";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null); // Store selected date
  const [workDetails, setWorkDetails] = useState([]); // Store work details for all dates
  const [timeRange, setTimeRange] = useState({ start: "", end: "" }); // Store start and end time
  const [dailyRate, setDailyRate] = useState("");

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
      const start = new Date(
        `${selectedDate.toDateString()} ${timeRange.start}`
      );
      const end = new Date(`${selectedDate.toDateString()} ${timeRange.end}`);

      if (start < end) {
        const hoursWorked = (end - start) / (1000 * 60 * 60);
        const newEntry = {
          date: selectedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          start: timeRange.start,
          end: timeRange.end,
          hours: hoursWorked,
          rate: parseFloat(dailyRate),
          earnings: hoursWorked * parseFloat(dailyRate),
        };

        setWorkDetails([...workDetails, newEntry]);
      } else {
        alert("La hora de salida debe ser mayor a la hora de entrada.");
      }
    } else {
      alert("Por favor, completa todos los campos");
    }
  };

  const deleteWorkDetail = (index) => {
    setWorkDetails(workDetails.filter((_, i) => i !== index));
  };

  const resetAll = () => {
    setSelectedDate(null);
    setWorkDetails([]);
    setTimeRange({ start: "", end: "" });
    setDailyRate("");
  };

  const calculateTotalEarnings = () => {
    return workDetails.reduce((total, entry) => total + entry.earnings, 0);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Income Tracker</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Selecciona una fecha:</h2>
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>

      {selectedDate && (
        <div style={{ marginBottom: "20px" }}>
          <h2>
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            :
          </h2>
          <div>
            <label>Hora de entrada:</label>
            <input
              type="time"
              name="start"
              value={timeRange.start}
              onChange={handleTimeChange}
              style={{ padding: "5px", fontSize: "16px", marginRight: "10px" }}
            />
            <label>Hora de salida:</label>
            <input
              type="time"
              name="end"
              value={timeRange.end}
              onChange={handleTimeChange}
              style={{ padding: "5px", fontSize: "16px" }}
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <label>Cuánto gano por hora:</label>
            <input
              type="number"
              placeholder="1000.00"
              value={dailyRate}
              onChange={handleDailyRateChange}
              style={{ padding: "5px", fontSize: "16px", marginLeft: "10px" }}
            />
          </div>
          <button
            onClick={saveWorkDetails}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Guardar turno
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>Ganancias totales:</h2>
        <p>${calculateTotalEarnings().toFixed(2)}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Sumario final:</h2>
        <ul>
          {workDetails.map((entry, index) => (
            <li key={index}>
              <button
                onClick={() => deleteWorkDetail(index)}
                style={{
                  marginRight: "10px",
                  cursor: "pointer",
                  color: "red",
                  border: "none",
                  background: "none",
                }}
              >
                🗑️
              </button>
              {entry.date}: {entry.start} - {entry.end},{" "}
              {entry.hours.toFixed(2)} horas @ ${entry.rate.toFixed(2)} / hora,
              Cobro total: ${entry.earnings.toFixed(2)}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "inline-block",
          }}
        >
          <button
            onClick={resetAll}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "red",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.target.textContent = "Borrar todo 💀";
            }}
            onMouseLeave={(e) => {
              e.target.textContent = "Borrar todo";
            }}
          >
            Borrar todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
