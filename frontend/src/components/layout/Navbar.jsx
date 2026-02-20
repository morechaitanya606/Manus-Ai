import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, wishlist } = useShop();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="navbar-wrap">
      <nav className="container navbar">
        <Link className="brand" to="/" onClick={closeMenu}>
          Atelier Thread
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/products" onClick={closeMenu}>
            Shop
          </NavLink>
          <NavLink to="/wishlist" onClick={closeMenu}>
            Wishlist <b>{wishlist.length}</b>
          </NavLink>
          <NavLink to="/cart" onClick={closeMenu}>
            Cart <b>{cart.length}</b>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" onClick={closeMenu}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu}>
              Admin
            </NavLink>
          )}
        </div>

        <div className={`nav-actions ${mobileOpen ? 'open' : ''}`}>
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          {isAuthenticated ? (
            <>
              <span className="welcome">{user?.name?.split(' ')[0]}</span>
              <button className="ghost-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="ghost-btn" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
