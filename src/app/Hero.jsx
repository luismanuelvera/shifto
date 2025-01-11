import React, { useState } from "react";
import Calendar from "react-calendar";
import Modal from "./Modal";
import { saveAs } from 'file-saver'; 
import Navbar from "./Navbar";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null); // Store selected date
  const [workDetails, setWorkDetails] = useState([]); // Store work details for all dates
  const [timeRange, setTimeRange] = useState({ start: "", end: "" }); // Store start and end time
  const [dailyRate, setDailyRate] = useState("");
  const [modal, setModal] = useState({ visible: false, message: '', onConfirm: null }); // Modal state

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

  const showModal = (message, onConfirm) => {
    setModal({ visible: true, message, onConfirm });
  };

  const closeModal = () => {
    setModal({ visible: false, message: '', onConfirm: null });
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
        showModal("La hora de salida debe ser mayor a la hora de entrada.");
      }
    } else {
      showModal("Por favor, completa todos los campos");
    }
  };

  const deleteWorkDetail = (index) => {
    showModal('¿Seguro querés borrar la entrada?', () => {
      setWorkDetails(workDetails.filter((_, i) => i !== index));
      closeModal();
    });
  };

  const resetAll = () => {
    showModal('¿Seguro querés borrar todo?', () => {
      setSelectedDate(null);
      setWorkDetails([]);
      setTimeRange({ start: "", end: "" });
      setDailyRate("");
      closeModal();
    })
  };

  const calculateTotalEarnings = () => {
    return workDetails.reduce((total, entry) => total + entry.earnings, 0);
  };

  const exportToText = () => {

    if (workDetails.length === 0){
      showModal("No hay datos para exportar.")
      return;
    }

    const textContent = workDetails.map(entry => (
      `${entry.date}: ${entry.start} - ${entry.end}, ${entry.hours.toFixed(2)} horas @ $${entry.rate.toFixed(2)}/hora, Cobro total: $${entry.earnings.toFixed(2)}\n`      
    )).join('');

    const total = 'Totales: horas trabajadas = ' + workDetails.reduce((total, entry) => total + entry.hours, 0)
    + ', Cobro total = ' + workDetails.reduce((total, entry) => total + entry.earnings, 0)

    const blob = new Blob([textContent + total], { type: 'text/plain;charset=utf-8' });
    saveAs(blob,   workDetails[0].date.substring( workDetails[0].date.indexOf(",") + 2, workDetails[0].date.length)  
    + ' - ' 
    + workDetails[workDetails.length-1].date.substring(workDetails[workDetails.length-1].date.indexOf(",") + 2, workDetails[workDetails.length-1].date.length) + '.txt');
  };

  const exportToExcel = () => {

    if (workDetails.length === 0){
      showModal("No hay datos para exportar.")
      return;
    }

    const rows = [
      ['Fecha', 'Hora de inicio', 'Hora de salida', 'Cobro por hora', 'Horas trabajadas', 'Cobro total'],
      ...workDetails.map(entry => [
        `"${entry.date}"`,
        entry.start,
        entry.end,
        entry.rate.toFixed(2),
        entry.hours.toFixed(2),
        entry.earnings.toFixed(2)
      ]),
      ['', '', '', 'Totales', workDetails.reduce((total, entry) => total + entry.hours, 0), workDetails.reduce((total, entry) => total + entry.earnings, 0)]
    ];
      
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob,   workDetails[0].date.substring( workDetails[0].date.indexOf(",") + 2, workDetails[0].date.length)  
    + ' - ' 
    + workDetails[workDetails.length-1].date.substring(workDetails[workDetails.length-1].date.indexOf(",") + 2, workDetails[workDetails.length-1].date.length)
    +'.csv');
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>      
      
      {/* <Navbar></Navbar> */}

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
                  color: "#F94144",
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

        <Modal
          visible={modal.visible}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />

        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "inline-block",
          }}
        >

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={exportToText}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#277DA1",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.textContent = "Exportar a Texto 📃";
              }}
              onMouseLeave={(e) => {
                e.target.textContent = "Exportar a Texto";
              }}
            >
              Exportar a Texto
            </button>

            <button
              onClick={resetAll}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#F94144",
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

            <button
              onClick={exportToExcel}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#43AA8B",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.textContent = "Exportar a Excel 📖";
              }}
              onMouseLeave={(e) => {
                e.target.textContent = "Exportar a Excel";
              }}
            >
              Exportar a Excel
            </button>
          </div>
        </div>
      </div>      
    </div>    
  );
};

export default App;
