import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useGetWeatherForecast } from './api/endpoints/weather-forecast/weather-forecast';
import { useAuthDispatch } from './auth.context';
import { WeatherForecast } from './api/models';

function App() {
  const [count, setCount] = useState(0);
  const dispatch = useAuthDispatch();
  const { data: weatherForecasts, refetch } = useGetWeatherForecast();

  useEffect(() => {
    dispatch('token');
    setTimeout(() => {
      refetch();
    }, 2000);
  }, [refetch, dispatch]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {weatherForecasts?.map((wf: WeatherForecast) => (
        <p key={wf.date}>
          {wf.date}: {wf.summary} - {wf.temperatureC}
        </p>
      ))}
    </>
  );
}

export default App;
