import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axiosClient from '../api/axiosClient';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Table {
  id: number;
  name: string;
  status: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  
  const [orderType, setOrderType] = useState<'delivery' | 'dine_in'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tableId, setTableId] = useState<number | ''>('');
  
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && orderType === 'dine_in' && tables.length === 0) {
      // Fetch tables when dine_in is selected
      axiosClient.get('/tables')
        .then((data: any) => setTables(data))
        .catch(err => console.error('Lỗi lấy danh sách bàn:', err));
    }
  }, [isOpen, orderType, tables.length]);

  const availableTables = tables.filter(t => t.status !== 'occupied');

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validation
    if (!customerName.trim()) {
      alert('Vui lòng nhập họ tên!'); return;
    }
    if (orderType === 'delivery' && !customerPhone.trim()) {
      alert('Vui lòng nhập số điện thoại liên lạc để nhận hàng!'); return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng!'); return;
    }
    if (orderType === 'dine_in' && tableId === '') {
      alert('Vui lòng chọn số bàn!'); return;
    }
    
    setLoading(true);
    try {
      await axiosClient.post('/orders', {
        orderItems: cart,
        totalPrice: totalPrice,
        orderType,
        customerName,
        customerPhone,
        shippingAddress: orderType === 'delivery' ? address : null,
        tableId: orderType === 'dine_in' ? tableId : null
      });

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        onClose();
        setSuccess(false);
        // Reset form
        setCustomerName(''); setCustomerPhone(''); setAddress(''); setTableId('');
      }, 3000);

    } catch (error) {
      console.error('Checkout error', error);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%', maxWidth: '550px', backgroundColor: 'var(--bg-dark)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>Thanh Toán Đơn Hàng</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>&times;</button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#4ade80' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h3>Đặt hàng thành công!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Đơn hàng của bạn đang được xử lý.</p>
          </div>
        ) : (
          <>
            {/* Order Items Summary */}
            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              {cart.map(item => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', width: 'fit-content', padding: '4px 8px' }}>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', width: '20px', justifyContent: 'center' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '1rem', cursor: 'pointer', display: 'flex', width: '20px', justifyContent: 'center' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                    >
                      Loại bỏ
                    </button>
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>Tổng cộng:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
              </div>
            </div>

            {/* Order Type Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                onClick={() => setOrderType('delivery')}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold',
                  background: orderType === 'delivery' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: orderType === 'delivery' ? '#000' : 'var(--text-primary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                }}>
                🛵 Giao Hàng Tận Nơi
              </button>
              <button 
                type="button"
                onClick={() => setOrderType('dine_in')}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold',
                  background: orderType === 'dine_in' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: orderType === 'dine_in' ? '#000' : 'var(--text-primary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                }}>
                🏪 Thưởng Thức Tại Quán
              </button>
            </div>

            <form onSubmit={handleCheckout}>
              {/* Common Info */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Họ Tên <span style={{color:'red'}}>*</span></label>
                  <input 
                    type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Số Điện Thoại {orderType === 'delivery' && <span style={{color:'red'}}>*</span>}</label>
                  <input 
                    type="tel" required={orderType === 'delivery'} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="VD: 090123..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Conditional Info matching Tabs */}
              {orderType === 'delivery' ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Địa Chỉ Giao Hàng <span style={{color:'red'}}>*</span></label>
                  <textarea 
                    required value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', minHeight: '60px', fontFamily: 'inherit' }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vị Trí Của Bạn (Số Bàn) <span style={{color:'red'}}>*</span></label>
                  <select 
                    required value={tableId} onChange={(e) => setTableId(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#2a2a2a', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}
                  >
                    <option value="" disabled>-- Vui lòng chọn bàn --</option>
                    {availableTables.length === 0 ? (
                      <option value="" disabled>⚠️ Hiện đã hết bàn trống</option>
                    ) : (
                      availableTables.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Đang gửi đơn...' : `Thanh Toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
