import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { useShop } from '../../contexts/ShopContext';
import LazyImage from './LazyImage';

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useShop();

  return (
    <article className="product-card fade-in">
      <button
        type="button"
        className={`wishlist-btn ${isWishlisted(product._id) ? 'active' : ''}`}
        onClick={() => toggleWishlist(product)}
      >
        ♥
      </button>

      <Link to={`/products/${product._id}`} className="product-image-link">
        <LazyImage src={product.images?.[0]?.url} alt={product.title} className="product-image" />
      </Link>

      <div className="product-body">
        <p className="meta">{product.category} · {product.type.replace('tshirt-', 't-shirt ')}</p>
        <h3>{product.title}</h3>
        <div className="product-footer">
          <strong>{formatCurrency(product.price)}</strong>
          <span>{product.stock} left</span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
