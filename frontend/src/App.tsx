import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import { CartProvider, useCart } from './context/CartContext';
import CheckoutModal from './components/CheckoutModal';
import Chatbot from './components/Chatbot';
import './App.css';

// Tách Header ra để có thể dùng useCart hook
const Header = ({ onCartClick }: { onCartClick: () => void }) => {
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) { setUser(null); }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isAdminOrStaff = user && (user.role === 'admin' || user.role === 'staff');

  return (
    <header className="glass">
      <div className="container header-content">
        <div className="logo">
          <h2>Nero<span>Coffee</span></h2>
        </div>
        <nav className="desktop-nav">
          <ul>
            <li><Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary)' : 'inherit', fontWeight: location.pathname === '/' ? 'bold' : 'normal' }}>Trang chủ</Link></li>
            <li><Link to="/menu" style={{ color: location.pathname.startsWith('/menu') ? 'var(--primary)' : 'inherit', fontWeight: location.pathname.startsWith('/menu') ? 'bold' : 'normal' }}>Thực đơn</Link></li>
            <li><Link to="/my-orders" style={{ color: location.pathname === '/my-orders' ? 'var(--primary)' : 'inherit', fontWeight: location.pathname === '/my-orders' ? 'bold' : 'normal' }}>Đơn hàng</Link></li>
            {isAdminOrStaff && <li><Link to="/admin" style={{ color: location.pathname === '/admin' ? 'var(--primary)' : 'inherit', fontWeight: location.pathname === '/admin' ? 'bold' : 'normal' }}>Trang Quản Trị</Link></li>}
          </ul>
        </nav>
        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>👋 {user.name}</span>
              <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Đăng xuất</button>
            </div>
          ) : (
            <Link to="/login" className="btn-outline">Đăng nhập</Link>
          )}
          <button className="cart-btn glass-card" onClick={onCartClick}>
            🛒 <span className="cart-count">{totalItems}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Header onCartClick={() => setIsCheckoutOpen(true)} />
          
          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<Home onOpenCheckout={() => setIsCheckoutOpen(true)} />} />
              <Route path="/menu" element={<Menu onOpenCheckout={() => setIsCheckoutOpen(true)} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
          <Chatbot onOpenCheckout={() => setIsCheckoutOpen(true)} />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
