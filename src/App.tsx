import './App.css';
import { AppRoutes } from './routes';
import { AppContextProvider } from './context';
import { HintProvider } from './components/InfrastructureCompo/HintProvider';
import ScrollToHash from './components/InfrastructureCompo/ScrollToHash';

function App() {
  return (
    <div className="App">
      <AppContextProvider>
        <ScrollToHash />
        <HintProvider>
          <AppRoutes />
        </HintProvider>
      </AppContextProvider>
    </div>
  );
}

export default App;
