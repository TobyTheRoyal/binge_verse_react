import React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          {routes.map(({ path, Component }, idx) => (
            <Route key={idx} path={path} element={<Component />} />
          ))}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;