import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import Eat from './pages/Eat';
import Couples from './pages/Couples';
import Profile from './pages/Profile';
import MobileNav from './components/MobileNav';

function App() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <div className="app">
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/train" element={isAuthenticated ? <Train /> : <Navigate to="/login" />} />
                <Route path="/eat" element={isAuthenticated ? <Eat /> : <Navigate to="/login" />} />
                <Route path="/couples" element={isAuthenticated ? <Couples /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
            {isAuthenticated && <MobileNav />}
        </div>
    );
}

export default App;
