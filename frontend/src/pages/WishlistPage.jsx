import { Link } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { formatCurrency } from '../utils/format';
import LazyImage from '../components/ui/LazyImage';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  if (!wishlist.length) {
    return (
      <section className="section container empty-state">
        <h1>Your wishlist is empty</h1>
        <Link to="/products" className="primary-btn">
          Discover Products
        </Link>
      </section>
    );
  }

  return (
    <section className="section container">
      <h1>Wishlist</h1>
      <div className="product-grid">
        {wishlist.map((product) => (
          <article key={product._id} className="product-card">
            <LazyImage src={product.images?.[0]?.url} alt={product.title} className="product-image" />
            <div className="product-body">
              <h3>{product.title}</h3>
              <strong>{formatCurrency(product.price)}</strong>
              <div className="wishlist-actions">
                <Link to={`/products/${product._id}`} className="ghost-btn">
                  View
                </Link>
                <button type="button" className="primary-btn" onClick={() => addToCart({ product, quantity: 1 })}>
                  Add to Cart
                </button>
                <button type="button" className="text-btn" onClick={() => toggleWishlist(product)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WishlistPage;
