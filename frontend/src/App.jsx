import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Catalog } from './pages/Catalog';
import { CakeDetail } from './pages/CakeDetail';
import { Basket } from './pages/Basket';
import { Notifications } from './pages/Notifications';
import { UserContext } from './contexts/UserContext';

const USER_ID = 'user-1';

function App() {
  return (
    <UserContext.Provider value={USER_ID}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="max-w-[1200px] w-full mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/cake/:id" element={<CakeDetail />} />
            <Route path="/basket" element={<Basket />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </UserContext.Provider>
  );
}

export default App;
