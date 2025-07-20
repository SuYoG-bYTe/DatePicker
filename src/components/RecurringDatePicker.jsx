import React, { useState, useEffect } from "react";
import { create } from "zustand";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {addDays,addWeeks,addMonths,addYears,isBefore,} from "date-fns";

const useRecurringStore = create((set) => ({
  frequency: "daily",
  interval: 1,
  weekdays: [],
  monthPattern: { week: 1, day: "Monday" },
  startDate: new Date(),
  endDate: null,
  setFrequency: (frequency) => set({ frequency }),
  setInterval: (interval) => set({ interval }),
  setWeekdays: (weekdays) => set({ weekdays }),
  setMonthPattern: (monthPattern) => set({ monthPattern }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
}));

const weekdaysOptions = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",];

const RecurringDatePicker = ({ onSubmit }) => {
  const {frequency,interval,weekdays,startDate,endDate,setFrequency,setInterval,setWeekdays,setStartDate,setEndDate,} = useRecurringStore();

  const [previewDates, setPreviewDates] = useState([]);

  const handleWeekdaysChange = (day) => {
    setWeekdays(
      weekdays.includes(day)
        ? weekdays.filter((d) => d !== day)
        : [...weekdays, day]
    );
  };

  const generateDates = () => {
    let dates = [];
    let current = startDate;
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      if (endDate && isBefore(endDate, current)) break;

      if (frequency === "daily") {
        dates.push(current);
        current = addDays(current, interval);
      }

      if (frequency === "weekly") {
        weekdays.forEach((day) => {
          const date = addDays(
            current,
            (weekdaysOptions.indexOf(day) - current.getDay() + 7) % 7
          );
          if (!dates.includes(date) && (!endDate || isBefore(date, endDate))) {
            dates.push(date);
          }
        });
        current = addWeeks(current, interval);
      }

      if (frequency === "monthly") {
        dates.push(current);
        current = addMonths(current, interval);
      }

      if (frequency === "yearly") {
        dates.push(current);
        current = addYears(current, interval);
      }
    }
    dates = dates.sort((a, b) => a - b);
    setPreviewDates(dates);
    return dates;
  };

  useEffect(() => {
    generateDates();
  }, [frequency, interval, weekdays, startDate, endDate]);

  const styles = {
    container: {
      padding: "2rem",
      backgroundColor: "white",
      borderRadius: "1rem",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.06)",
      maxWidth: "400px",
      margin: "auto",
      fontFamily: "sans-serif",
    },
    header: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#374151",
      marginBottom: "1rem",
    },
    label: {
      display: "block",
      fontWeight: 500,
      marginBottom: "0.25rem",
      color: "#4b5563",
    },
    input: {
      width: "100%",
      border: "1px solid #d1d5db",
      padding: "0.5rem",
      borderRadius: "0.375rem",
      marginBottom: "1rem",
    },
    weekdaysContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "0.75rem",
    },
    weekdayBtn: (selected) => ({
      padding: "0.25rem 0.75rem",
      fontSize: "0.875rem",
      borderRadius: "0.375rem",
      border: "1px solid #d1d5db",
      cursor: "pointer",
      backgroundColor: selected ? "#2563eb" : "#f3f4f6",
      color: selected ? "white" : "#374151",
    }),
    confirmBtn: {
      width: "100%",
      backgroundColor: "#2563eb",
      color: "white",
      padding: "0.5rem",
      borderRadius: "0.5rem",
      fontWeight: 500,
      cursor: "pointer",
      border: "none",
      marginTop: "1rem",
    },
    previewLabel: {
      fontWeight: 500,
      marginBottom: "0.25rem",
      color: "#374151",
    },
    previewBox: {
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      padding: "0.75rem",
      height: "8rem",
      overflowY: "auto",
      fontSize: "0.875rem",
      color: "#4b5563",
    },
    previewEmpty: {
      fontStyle: "italic",
      color: "#9ca3af",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Recurring Date Picker</h2>

      <div>
        <label style={styles.label}>Frequency</label>
        <select
          style={styles.input}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label style={styles.label}>Repeat Every</label>
        <input
          type="number"
          min="1"
          style={styles.input}
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />
      </div>

      {frequency === "weekly" && (
        <div>
          <label style={styles.label}>Days of the Week</label>
          <div style={styles.weekdaysContainer}>
            {weekdaysOptions.map((day) => (
              <button
                key={day}
                onClick={() => handleWeekdaysChange(day)}
                style={styles.weekdayBtn(weekdays.includes(day))}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label style={styles.label}>Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          style={styles.input}
        />
      </div>

      <div>
        <label style={styles.label}>End Date (optional)</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          isClearable
          style={styles.input}
        />
      </div>

      <button style={styles.confirmBtn} onClick={() => onSubmit(generateDates())}>
        Confirm Recurrence
      </button>

      <div>
        <h4 style={styles.previewLabel}>Preview Dates:</h4>
        <div style={styles.previewBox}>
          {previewDates.length === 0 && (
            <p style={styles.previewEmpty}>No dates selected</p>
          )}
          {previewDates.map((date, index) => (
            <div key={index}>{date.toDateString()}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecurringDatePicker;
