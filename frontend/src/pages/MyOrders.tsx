import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

interface Order {
  id: number;
  total_price: number;
  status: string;
  shipping_address: string;
  created_at: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await axiosClient.get('/orders/myorders') as any;
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffaa00';
      case 'processing': return '#00aaff';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#ff4444';
      default: return '#aaaaaa';
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Đơn hàng <span className="text-primary">Của Tôi</span></h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Bạn chưa có đơn hàng nào.</p>
          <button className="btn-primary" onClick={() => navigate('/#menu')}>Đặt hàng ngay</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Đơn hàng #{order.id}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Địa chỉ: {order.shipping_address}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: getStatusColor(order.status), 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize',
                  padding: '0.2rem 0.8rem',
                  borderRadius: '20px',
                  border: `1px solid ${getStatusColor(order.status)}`,
                  display: 'inline-block'
                }}>
                  {order.status}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
