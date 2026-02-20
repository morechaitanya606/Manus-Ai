import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productApi } from '../api/services';
import Loader from '../components/ui/Loader';
import CustomizationStudio from '../components/ui/CustomizationStudio';
import { formatCurrency, buildImageUrl } from '../utils/format';
import { useShop } from '../contexts/ShopContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState({
    selectedSize: '',
    selectedColor: '',
    customText: '',
    customColor: '#ffffff',
    customImage: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productApi.getById(id);
        setProduct(data);
        setCustomization((prev) => ({
          ...prev,
          selectedSize: data.sizes?.[0] || '',
          selectedColor: data.colors?.[0] || ''
        }));
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleStateChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit = useMemo(() => {
    if (!product) return false;
    if (product.sizes?.length && !customization.selectedSize) return false;
    if (product.colors?.length && !customization.selectedColor) return false;
    return true;
  }, [product, customization]);

  const handleAdd = async () => {
    if (!product || !canSubmit) return;

    try {
      await addToCart({
        product,
        quantity,
        selectedSize: customization.selectedSize,
        selectedColor: customization.selectedColor,
        customization: {
          customText: customization.customText,
          customColor: customization.customColor,
          customImage: customization.customImage
        }
      });
      setMessage('Added to cart');
      setTimeout(() => setMessage(''), 1800);
    } catch (apiError) {
      setMessage(apiError.response?.data?.message || 'Unable to add to cart');
    }
  };

  if (loading) return <Loader label="Loading product" />;
  if (error) return <section className="section container"><p>{error}</p></section>;
  if (!product) return null;

  return (
    <section className="section container product-detail">
      <div className="product-detail-grid">
        <div className="gallery">
          <img src={buildImageUrl(product.images?.[0]?.url)} alt={product.title} className="main-image" />
          <div className="thumb-row">
            {(product.images || []).slice(0, 4).map((img) => (
              <img key={img.url} src={buildImageUrl(img.url)} alt={product.title} />
            ))}
          </div>
        </div>

        <div className="details">
          <p className="meta">{product.category} · {product.type}</p>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <h3>{formatCurrency(product.price)}</h3>
          <p className="stock">Stock: {product.stock}</p>

          <button
            type="button"
            className={`ghost-btn ${isWishlisted(product._id) ? 'active' : ''}`}
            onClick={() => toggleWishlist(product)}
          >
            {isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          {message && <p className="flash-msg">{message}</p>}
        </div>
      </div>

      <CustomizationStudio
        product={product}
        state={customization}
        onStateChange={handleStateChange}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAdd}
      />
    </section>
  );
};

export default ProductDetailPage;
