import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/services';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productApi.list({ limit: 8, page: 1, sortBy: 'createdAt', order: 'desc' });
        setFeatured(data.data);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content fade-in">
            <p className="eyebrow">Custom Fashion Studio</p>
            <h1>Personalized streetwear and essentials for men and women.</h1>
            <p>
              Build your own premium fit. Upload artwork, add text, select colors and sizes, and ship your design in
              a few clicks.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="primary-btn">
                Shop Collection
              </Link>
              <Link to="/products?category=men" className="ghost-btn">
                Men
              </Link>
              <Link to="/products?category=women" className="ghost-btn">
                Women
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-card hero-card-1" />
            <div className="hero-card hero-card-2" />
            <div className="hero-card hero-card-3" />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Featured Drops</h2>
          <Link to="/products" className="text-btn">
            View all
          </Link>
        </div>

        {loading ? (
          <Loader label="Loading products" />
        ) : (
          <div className="product-grid">{featured.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        )}
      </section>

      <section className="section container category-banner">
        <div>
          <h3>Customization Capabilities</h3>
          <p>Upload your image, add text, pick color and size, then preview instantly before checkout.</p>
        </div>
        <Link to="/products" className="primary-btn">
          Start Designing
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
