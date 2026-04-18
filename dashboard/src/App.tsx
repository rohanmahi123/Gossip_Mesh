import Dashboard from './Dashboard';
import { DeviceProvider } from './contexts/DeviceContext';
import { MyStatsProvider } from './contexts/MyStatsContext';

function App() {
  return (
    <DeviceProvider>
      <MyStatsProvider>
        <div className="App">
          <Dashboard />
        </div>
      </MyStatsProvider>
    </DeviceProvider>
  );
}

export default App;
