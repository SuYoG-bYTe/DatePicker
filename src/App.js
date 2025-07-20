import RecurringDatePicker from "./components/RecurringDatePicker";

function App() {
  return (
    <div className="App">
      <RecurringDatePicker onSubmit={(dates) => console.log(dates)} />
    </div>
  );
}

export default App;
