import './App.css';
import { AppRoutes } from './routes';
import { AppContextProvider } from './context';

function App() {
  return (
    <div className="App">
      <AppContextProvider>
        <AppRoutes />
      </AppContextProvider>
    </div>
  );
}

export default App;
