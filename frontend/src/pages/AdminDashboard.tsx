import { useState, useEffect, useRef, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';
import '../App.css';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface Order {
  id: number;
  user_name: string;
  email: string;
  customer_name: string;
  customer_phone: string;
  order_type: 'dine_in' | 'delivery';
  table_name: string;
  table_id?: number;
  total_price: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
  isNew?: boolean;
}

interface Table {
  id: number;
  name: string;
  status: string;
}

// Toast notification component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '90px', right: '20px', zIndex: 10000,
      background: 'linear-gradient(135deg, #d4a017, #b8860b)',
      color: '#fff', padding: '16px 24px', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(212, 160, 23, 0.4)',
      display: 'flex', alignItems: 'center', gap: '12px',
      animation: 'slideInRight 0.4s ease-out',
      maxWidth: '400px', fontWeight: 500
    }}>
      <span style={{ fontSize: '1.5rem' }}>🔔</span>
      <span>{message}</span>
      <button onClick={onClose} style={{
        marginLeft: '12px', background: 'rgba(255,255,255,0.2)',
        border: 'none', color: '#fff', borderRadius: '50%',
        width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px'
      }}>✕</button>
    </div>
  );
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  processing: { label: 'Đang pha chế', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  completed: { label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tables' | 'categories' | 'products'>('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string, description: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const toastIdRef = useRef(0);
  
  // Filtering state
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD
  
  // Table management states
  const [newTableName, setNewTableName] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Category management states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Product management states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', is_featured: false });

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(830, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(830, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const showToast = (message: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadTables = async () => {
    try {
      const data = await axiosClient.get('/tables') as any;
      setTables(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách bàn:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await axiosClient.get('/categories') as any;
      setCategories(data.data || data);
    } catch (error) {
      console.error('Lỗi lấy danh sách danh mục:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await axiosClient.get('/products') as any;
      setProducts(data.data || data);
    } catch (error) {
      console.error('Lỗi lấy danh sách sản phẩm:', error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData, tablesData, categoriesData] = await Promise.all([
          axiosClient.get('/products'),
          axiosClient.get('/orders'),
          axiosClient.get('/tables'),
          axiosClient.get('/categories')
        ].map(p => p.catch(() => [])));

        setProducts((productsData as any).data || productsData as any[]);
        setOrders((ordersData as any).data || ordersData as Order[]);
        setTables((tablesData as any).data || tablesData as Table[]);
        setCategories((categoriesData as any).data || categoriesData as any[]);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu admin', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Socket.IO real-time listeners
  useEffect(() => {
    const handleNewOrder = (order: Order & { isUpdate?: boolean }) => {
      if (order.isUpdate) {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        playNotificationSound();
        showToast(`🔄 Bàn [${order.table_name || '?'}] vừa gọi thêm món — Tổng: ${new Intl.NumberFormat('vi-VN').format(order.total_price)}đ`);
        return;
      }

      setOrders(prev => [{ ...order, isNew: true }, ...prev]);
      setNewOrderCount(prev => prev + 1);
      playNotificationSound();
      
      if (order.order_type === 'dine_in' && order.table_id) {
        setTables(prev => prev.map(t => t.id === order.table_id ? { ...t, status: 'occupied' } : t));
      }
      
      const displayName = order.customer_name || order.user_name || 'Khách vãng lai';
      const orderTypeTxt = order.order_type === 'dine_in' ? `Tại ${order.table_name || 'Quán'}` : 'Giao Ngay';
      
      showToast(`🆕 Đơn [${orderTypeTxt}] #${order.id} từ ${displayName} — ${new Intl.NumberFormat('vi-VN').format(order.total_price)}đ`);
      
      // Remove "isNew" highlight after 10 seconds
      setTimeout(() => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isNew: false } : o));
      }, 10000);
    };

    const handleStatusUpdate = (data: { orderId: number; status: string }) => {
      setOrders(prev => prev.map(o =>
        o.id === data.orderId ? { ...o, status: data.status } : o
      ));
    };

    const handleTableCheckout = (data: { tableId: number }) => {
      setTables(prev => prev.map(t => t.id === data.tableId ? { ...t, status: 'available' } : t));
      setOrders(prev => prev.map(o => (o.table_id === data.tableId && ['pending', 'processing'].includes(o.status)) ? { ...o, status: 'completed' } : o));
      setSelectedTable(prev => prev?.id === data.tableId ? null : prev);
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);
    socket.on('table_checkout', handleTableCheckout);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
      socket.off('table_checkout', handleTableCheckout);
    };
  }, []);

  // Update order status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });
      // update local immediately for better UX
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  // Table Management Handlers
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    try {
      await axiosClient.post('/tables', { name: newTableName });
      setNewTableName('');
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm bàn');
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
    try {
      await axiosClient.delete(`/tables/${id}`);
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa bàn này');
    }
  };

  const handleUpdateTableStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    try {
      await axiosClient.put(`/tables/${id}`, { status: newStatus });
      loadTables();
    } catch (err) {
      showToast('❌ Lỗi cập nhật trạng thái bàn');
    }
  };

  const handleCheckoutTable = async (tableId: number) => {
    try {
      await axiosClient.post(`/tables/${tableId}/checkout`);
      // Local optimistic update
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'available' } : t));
      setOrders(prev => prev.map(o => (o.table_id === tableId && ['pending', 'processing'].includes(o.status)) ? { ...o, status: 'completed' } : o));
      setSelectedTable(null);
      showToast('✅ Đã thanh toán bàn thành công');
    } catch (error: any) {
      showToast('❌ Lỗi thanh toán bàn: ' + (error.response?.data?.message || 'Lỗi server'));
    }
  };

  // Category Management Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await axiosClient.post('/categories', { name: newCategoryName, description: newCategoryDesc });
      setNewCategoryName('');
      setNewCategoryDesc('');
      loadCategories();
      showToast('✅ Thêm danh mục thành công');
    } catch (err: any) {
      showToast('❌ Lỗi thêm danh mục: ' + (err.response?.data?.message || 'Lỗi server'));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Hãy cẩn thận vì sản phẩm thuộc danh mục sẽ bị ảnh hưởng.')) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      loadCategories();
      showToast('✅ Đã xóa danh mục');
    } catch (err: any) {
      showToast('❌ Lỗi xóa danh mục: ' + (err.response?.data?.message || 'Không thể xóa'));
    }
  };

  // Product Management Handlers
  const resetProductForm = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', description: '', price: '', category_id: '', image_url: '', is_featured: false });
  };

  const handleEditProduct = (p: any) => {
    setEditingProduct(p);
    setNewProduct({ 
      name: p.name, description: p.description || '', price: p.price.toString(), 
      category_id: p.category_id ? p.category_id.toString() : '', 
      image_url: p.image_url || '', is_featured: p.is_featured === 1 || p.is_featured === true 
    });
    // Cuộn lên đầu để tiện sửa form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      showToast('❌ Vui lòng nhập đủ tên, giá và danh mục!');
      return;
    }
    try {
      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct.id}`, newProduct);
        showToast('✅ Đã cập nhật sản phẩm');
      } else {
        await axiosClient.post('/products', newProduct);
        showToast('✅ Đã thêm sản phẩm mới');
      }
      resetProductForm();
      loadProducts();
    } catch (err: any) {
      showToast('❌ Lỗi xử lý sản phẩm: ' + (err.response?.data?.message || 'Lỗi server'));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      showToast('✅ Đã xóa sản phẩm');
      loadProducts();
    } catch (err: any) {
      showToast('❌ Lỗi xóa sản phẩm');
    }
  };

  // Derived filtered orders
  const filteredOrders = useMemo(() => {
    if (!filterDate) return orders;
    return orders.filter(o => {
      if (!o.created_at) return false;
      // Convert UTC/ISO to local YYYY-MM-DD string
      const orderDate = new Date(o.created_at).toLocaleDateString('en-CA');
      return orderDate === filterDate;
    });
  }, [orders, filterDate]);

  const totalRevenue = filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const processingOrders = filteredOrders.filter(o => o.status === 'processing').length;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Đang tải trang quản trị...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Toast Notifications */}
      {toasts.map(t => <Toast key={t.id} message={t.message} onClose={() => removeToast(t.id)} />)}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(212,160,23,0.3); }
          50% { box-shadow: 0 0 20px rgba(212,160,23,0.6); }
        }
        @keyframes highlightRow {
          0% { background: rgba(212,160,23,0.25); }
          100% { background: rgba(212,160,23,0.05); }
        }
        .new-order-row { animation: highlightRow 3s ease-out; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; display: inline-block; }
        .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 8px; animation: pulseGlow 2s infinite; }
        
        .admin-tab { padding: 10px 24px; cursor: pointer; border-bottom: 2px solid transparent; font-size: 1.1rem; font-weight: 600; transition: all 0.3s; color: var(--text-secondary); }
        .admin-tab.active { color: var(--primary); border-bottom: 2px solid var(--primary); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Bảng Điều Khiển <span className="text-primary">Admin</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.85rem' }}>
            <span className="pulse-dot"></span> Đang kết nối real-time
          </div>
          {newOrderCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #d4a017, #b8860b)', color: '#fff', padding: '8px 16px', borderRadius: '20px',
              fontSize: '0.85rem', fontWeight: 600, animation: 'pulseGlow 2s infinite', cursor: 'pointer'
            }} onClick={() => setNewOrderCount(0)}>
              🔔 {newOrderCount} thông báo
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Tổng Quan & Đơn Hàng</div>
        <div className={`admin-tab ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>Quản Lý Bàn</div>
        <div className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Quản Lý Danh Mục</div>
        <div className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Quản Lý Sản Phẩm</div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Header Stats / Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Thống Kê Kinh Doanh</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Lọc theo ngày:</label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', cursor: 'pointer' }}
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ✕ Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tổng Đơn Hàng</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{filteredOrders.length}</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Chờ Xử Lý</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{pendingOrders}</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Đang Pha Chế</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{processingOrders}</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Doanh Thu</h3>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          {/* Live Orders Table */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h2>Đơn Hàng <span className="text-primary">Trực Tiếp</span></h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Mã</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Khách hàng</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Loại / Địa Chỉ</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Sản phẩm</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Tổng tiền</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có đơn hàng nào trong ngày này.</td></tr>
                  ) : (
                    filteredOrders.map(order => {
                      const st = statusLabels[order.status] || statusLabels.pending;
                      const cName = order.customer_name || order.user_name || 'Khách vãng lai';
                      const cPhone = order.customer_phone || order.email || '';
                      
                      return (
                        <tr key={order.id} className={order.isNew ? 'new-order-row' : ''} style={{ transition: 'background 0.3s' }}>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)', fontWeight: 600 }}>
                            #{order.id}{order.isNew && <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: 'var(--primary)', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>MỚI</span>}
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: 500 }}>{cName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cPhone}</div>
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem', maxWidth: '200px' }}>
                            {order.order_type === 'dine_in' ? (
                              <div>
                                <span className="status-badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', marginBottom: '4px' }}>🏪 Tại Quán</span>
                                <div style={{ fontWeight: 'bold' }}>{order.table_name || 'Đã chọn bàn'}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="status-badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', marginBottom: '4px' }}>🛵 Giao Hàng</span>
                                <div style={{ color: 'var(--text-secondary)' }}>{order.shipping_address}</div>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem', maxWidth: '180px' }}>
                            {order.items?.map(item => `${item.name} x${item.quantity}`).join(', ') || '—'}
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--primary)', fontWeight: 600 }}>
                            {formatCurrency(order.total_price)}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{formatTime(order.created_at)}</div>
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                            <span className="status-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              <option value="pending">Chờ xử lý</option>
                              <option value="processing">Đang pha chế</option>
                              <option value="completed">Hoàn thành</option>
                              <option value="cancelled">Hủy</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'tables' ? (
        /* TABLE MANAGEMENT TAB */
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            Quản Lý Sơ Đồ Bàn
          </h2>
          
          <form onSubmit={handleAddTable} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              value={newTableName} 
              onChange={e => setNewTableName(e.target.value)}
              placeholder="Nhập tên bàn mới (VD: Bàn 11, VIP 2)"
              style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
              required
            />
            <button className="btn-primary" type="submit">➕ Thêm Bàn</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {tables.map(table => (
              <div key={table.id} style={{
                background: table.status === 'occupied' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${table.status === 'occupied' ? '#ef4444' : 'var(--glass-border)'}`,
                borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', position: 'relative'
              }}>
                <button 
                  onClick={() => handleDeleteTable(table.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}
                  title="Xóa bàn"
                >✖</button>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{table.status === 'occupied' ? '☕' : '🪑'}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: table.status === 'occupied' ? '#ef4444' : '#fff' }}>{table.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {table.status === 'occupied' ? 'Đang có khách' : 'Trống'}
                </div>
                <button 
                  className={table.status === 'occupied' ? "btn-outline" : "btn-primary"}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '100%', borderColor: table.status === 'occupied' ? '#ef4444' : 'var(--primary)', color: table.status === 'occupied' ? '#ef4444' : '#000' }}
                  onClick={() => table.status === 'occupied' ? setSelectedTable(table) : handleUpdateTableStatus(table.id, table.status)}
                >
                  {table.status === 'occupied' ? 'Xem Bill & Thanh toán' : 'Đánh dấu có khách'}
                </button>
              </div>
            ))}
            {tables.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu bàn.</p>}
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        /* CATEGORY MANAGEMENT TAB */
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            Quản Lý Danh Mục (Catalog)
          </h2>
          
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Tên danh mục (Cà Phê, Sinh Tố, v.v.)"
              style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
              required
            />
            <input 
              type="text" 
              value={newCategoryDesc} 
              onChange={e => setNewCategoryDesc(e.target.value)}
              placeholder="Mô tả danh mục (tùy chọn)"
              style={{ flex: 2, minWidth: '300px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
            />
            <button className="btn-primary" type="submit">➕ Thêm Mới</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Tên Danh Mục</th>
                <th style={{ padding: '12px' }}>Mô Tả</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có danh mục nào.</td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>#{cat.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{cat.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{cat.description || '—'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'products' ? (
        /* PRODUCT MANAGEMENT TAB */
        <div className="glass-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            Quản Lý Sản Phẩm
          </h2>
          
          <form onSubmit={handleAddOrUpdateProduct} style={{ display: 'flex', gap: '1.2rem', marginBottom: '2.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '100%', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
              {editingProduct ? 'Chỉnh sửa sản phẩm: ' + editingProduct.name : 'Thêm sản phẩm mới'}
            </div>
            
            <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tên sản phẩm <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" placeholder="Nhập tên sản phẩm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem' }} required />
            </div>

            <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Danh mục <span style={{color: '#ef4444'}}>*</span></label>
              <select value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem', cursor: 'pointer' }} required>
                <option value="" disabled style={{ color: '#000', background: '#fff' }}>-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id} style={{ color: '#000', background: '#fff' }}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Giá (VNĐ) <span style={{color: '#ef4444'}}>*</span></label>
              <input type="number" placeholder="Nhập giá tiền" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem' }} required />
            </div>

            <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>URL Hình ảnh</label>
              <input type="text" placeholder="https://..." value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem' }} />
            </div>

            <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mô tả sản phẩm</label>
              <textarea placeholder="Mô tả chi tiết..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '1rem', minHeight: '80px', fontFamily: 'inherit' }} />
            </div>

            <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <input type="checkbox" id="is_featured" checked={newProduct.is_featured} onChange={e => setNewProduct({...newProduct, is_featured: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="is_featured" style={{ cursor: 'pointer', userSelect: 'none', color: '#fff' }}>Sản phẩm Nổi Bật (hiển thị trên Chatbot/Trang chủ)</label>
            </div>

            <div style={{ flex: '1 1 100%', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              {editingProduct && <button type="button" className="btn-outline" onClick={resetProductForm} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}>Hủy Sửa</button>}
              <button className="btn-primary" type="submit" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}>{editingProduct ? '💾 Lưu Thay Đổi' : '➕ Thêm Sản Phẩm'}</button>
            </div>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px' }}>Ảnh</th>
                  <th style={{ padding: '12px' }}>Sản Phẩm</th>
                  <th style={{ padding: '12px' }}>Danh Mục</th>
                  <th style={{ padding: '12px' }}>Giá</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có sản phẩm nào.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{width:'50px',height:'50px',background:'rgba(255,255,255,0.1)',borderRadius:'8px'}}/>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                        {p.is_featured ? <span style={{ fontSize:'0.7rem', background:'var(--primary)', color:'#000', padding:'2px 6px', borderRadius:'4px' }}>Nổi bật</span> : null}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.category_name || '-'}</td>
                      <td style={{ padding: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(p.price)}đ</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => handleEditProduct(p)} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginRight: '8px' }}>Sửa</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Table Details Modal */}
      {selectedTable && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setSelectedTable(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Chi tiết Hóa Đơn — <span className="text-primary">{selectedTable.name}</span></h2>
            
            {(() => {
              const activeOrder = orders.find(o => o.table_id === selectedTable.id && ['pending', 'processing'].includes(o.status));
              
              if (!activeOrder) {
                return (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Bàn này hiện không có hóa đơn nào chưa thanh toán. (Có thể do mạng chậm, hãy tải lại trang).
                  </div>
                );
              }

              return (
                <div>
                  <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div>Mã ĐH: #{activeOrder.id}</div>
                    <div>Khách: {activeOrder.customer_name || activeOrder.user_name || 'Khách vãng lai'}</div>
                    <div>Thời gian: {formatTime(activeOrder.created_at)}</div>
                  </div>
                  
                  <table style={{ width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Sản phẩm</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>SL</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrder.items?.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem 0' }}>{item.name}</td>
                          <td style={{ textAlign: 'right', padding: '0.5rem 0' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', padding: '0.5rem 0' }}>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                    <span>Tổng Tiền:</span>
                    <span className="text-primary" style={{ fontSize: '1.5rem' }}>{formatCurrency(activeOrder.total_price)}</span>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                    onClick={() => handleCheckoutTable(selectedTable.id)}
                  >
                    Đã Thanh Toán Khách
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
