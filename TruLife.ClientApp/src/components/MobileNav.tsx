import { NavLink } from 'react-router-dom';

const MobileNav = () => {
    return (
        <nav className="mobile-nav">
            <NavLink to="/dashboard" className="mobile-nav-item">
                <span className="mobile-nav-icon">🏠</span>
                <span>Home</span>
            </NavLink>
            <NavLink to="/train" className="mobile-nav-item">
                <span className="mobile-nav-icon">💪</span>
                <span>Train</span>
            </NavLink>
            <NavLink to="/eat" className="mobile-nav-item">
                <span className="mobile-nav-icon">🍽️</span>
                <span>Eat</span>
            </NavLink>
            <NavLink to="/teamwork" className="mobile-nav-item">
                <span className="mobile-nav-icon">🤝</span>
                <span>Teamwork</span>
            </NavLink>
            <NavLink to="/profile" className="mobile-nav-item">
                <span className="mobile-nav-icon">👤</span>
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default MobileNav;
