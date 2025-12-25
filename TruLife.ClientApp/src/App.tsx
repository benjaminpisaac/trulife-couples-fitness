import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import Train from './pages/Train';
import Eat from './pages/Eat';
import Couples from './pages/Couples';
import Profile from './pages/Profile';
import DNA from './pages/DNA';
import Labs from './pages/Labs';
import Recovery from './pages/Recovery';
import Coaching from './pages/Coaching';
import Programs from './pages/Programs';
import MobileNav from './components/MobileNav';
import ServerWakeup from './components/ServerWakeup';

function App() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [serverReady, setServerReady] = useState(false);

    // Show wakeup screen until server is ready
    if (!serverReady) {
        return <ServerWakeup onReady={() => setServerReady(true)} />;
    }

    return (
        <div className="app">
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/today" element={isAuthenticated ? <Today /> : <Navigate to="/login" />} />
                <Route path="/train" element={isAuthenticated ? <Train /> : <Navigate to="/login" />} />
                <Route path="/eat" element={isAuthenticated ? <Eat /> : <Navigate to="/login" />} />
                <Route path="/couples" element={isAuthenticated ? <Couples /> : <Navigate to="/login" />} />
                <Route path="/dna" element={isAuthenticated ? <DNA /> : <Navigate to="/login" />} />
                <Route path="/labs" element={isAuthenticated ? <Labs /> : <Navigate to="/login" />} />
                <Route path="/recovery" element={isAuthenticated ? <Recovery /> : <Navigate to="/login" />} />
                <Route path="/coaching" element={isAuthenticated ? <Coaching /> : <Navigate to="/login" />} />
                <Route path="/programs" element={isAuthenticated ? <Programs /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
            {isAuthenticated && <MobileNav />}
        </div>
    );
}

export default App;

