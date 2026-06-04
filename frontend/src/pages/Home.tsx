import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onOpenCheckout: () => void;
}

const Home = ({ onOpenCheckout }: HomeProps) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero container animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="hero-content" style={{ flex: 1, minWidth: '350px', paddingRight: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            Hương vị cà phê <br /><span className="text-primary">Đích thực</span> mỗi ngày
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '500px' }}>
            Khám phá bộ sưu tập đồ uống thượng hạng được chế tác hoàn hảo, mang đến cho bạn không gian làm việc và trải nghiệm tuyệt vời nhất.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onOpenCheckout()} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Thanh Toán Nhanh</button>
            <button className="btn-outline" onClick={() => navigate('/menu')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Xem Thực Đơn</button>
          </div>
        </div>
        <div className="hero-image" style={{ flex: 1, minWidth: '350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '650px', height: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src="/hero-banner.png" alt="NeroCoffee Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
