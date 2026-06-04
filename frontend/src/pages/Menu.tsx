import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface MenuProps {
  onOpenCheckout: () => void;
}

const ITEMS_PER_PAGE = 12;

const Menu = ({ onOpenCheckout }: MenuProps) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleQuantityChange = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          axiosClient.get('/products'),
          axiosClient.get('/categories')
        ]);
        setProducts((productsData.data || productsData) as any);
        setCategories((categoriesData.data || categoriesData) as any);
      } catch (error) {
        console.error('Lỗi tải dữ liệu menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on active category
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category_id === activeTab);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: number | 'all') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page to 1 on category change
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInDown 0.5s ease-out' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Thực Đơn <span className="text-primary">Đặc Sắc</span></h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Tuyển tập những hương vị tinh túy nhất từ hạt cà phê thượng hạng và nguyên liệu tươi ngon.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Đang tải thực đơn...
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginBottom: '3rem', 
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <button
              className={activeTab === 'all' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 600, transition: 'all 0.3s' }}
              onClick={() => handleTabChange('all')}
            >
              Tất Cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={activeTab === cat.id ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 600, transition: 'all 0.3s' }}
                onClick={() => handleTabChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            animation: 'fadeIn 0.8s ease-out'
          }}>
            {displayedProducts.map(product => (
              <div key={product.id} className="glass-card product-card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                <div style={{ 
                  height: '200px', 
                  backgroundColor: 'var(--bg-dark)', 
                  borderRadius: '16px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  overflow: 'hidden'
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} className="product-img-hover" />
                  ) : '☕'}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{product.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>{product.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px 8px', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
                      <button 
                        onClick={() => handleQuantityChange(product.id, -1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ fontSize: '0.95rem', minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{quantities[product.id] || 1}</span>
                      <button 
                        onClick={() => handleQuantityChange(product.id, 1)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                      >+</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-outline" 
                        style={{ padding: '0.5rem 0.8rem', fontSize: '1.1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                        title="Thêm vào giỏ"
                        onClick={() => {
                          addToCart({
                            product_id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url,
                            quantity: quantities[product.id] || 1
                          });
                          // Reset qty back to 1 after adding
                          setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                        }}
                      >
                        🛒
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 600 }}
                        onClick={() => {
                          addToCart({
                            product_id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url,
                            quantity: quantities[product.id] || 1
                          });
                          setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                          onOpenCheckout();
                        }}
                      >
                        Mua Ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {displayedProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍃</div>
                <p style={{ fontSize: '1.1rem' }}>Không có sản phẩm nào trong danh mục này.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4rem' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Trước
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: currentPage === pageNum ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: currentPage === pageNum ? '#000' : 'var(--text-primary)',
                        fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .product-img-hover:hover {
          transform: scale(1.08);
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
        }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
};

export default Menu;
