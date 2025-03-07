import events from "./events.json";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Events</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Object Name</th>
            <th>Actor</th>
            <th>Message</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.uuid}>
              <td>{event.object_name}</td>
              <td>
                {event.actor_type} {event.actor_id}
              </td>
              <td>{event.message}</td>
              <td>{event.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
