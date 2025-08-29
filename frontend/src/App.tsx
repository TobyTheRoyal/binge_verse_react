import React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthGuard from './components/AuthGuard';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          {routes.map(({ path, Component, requiresAuth }, idx) => {
            const element = requiresAuth ? (
              <AuthGuard>
                <Component />
              </AuthGuard>
            ) : (
              <Component />
            );
            return <Route key={idx} path={path} element={element} />;
          })}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;