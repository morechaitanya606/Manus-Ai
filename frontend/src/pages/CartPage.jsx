import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, buildImageUrl } from '../utils/format';
import { orderApi } from '../api/services';

const CartPage = () => {
  const { cart, cartSubtotal, updateCartItemQuantity, removeCartItem, clearCart } = useShop();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const summary = useMemo(() => {
    const shipping = cartSubtotal > 150 ? 0 : cart.length ? 9 : 0;
    const total = cartSubtotal + shipping;
    return { shipping, total };
  }, [cartSubtotal, cart.length]);

  const handleCheckout = async () => {
    if (!cart.length || loading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { data: intent } = await orderApi.paymentIntent(summary.total);

      const payload = {
        shippingAddress,
        paymentProvider: intent.provider
      };

      const { data: order } = await orderApi.checkoutCart(payload);
      await orderApi.markPaid(order._id, intent.reference);
      await clearCart();
      setMessage('Order placed successfully with mock payment confirmation.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <section className="section container empty-state">
        <h1>Your cart is empty</h1>
        <Link to="/products" className="primary-btn">
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="section container cart-layout">
      <div>
        <h1>Shopping Cart</h1>
        <div className="cart-items">
          {cart.map((item) => {
            const product = item.product || item;
            const unitPrice = product.price ?? item.priceSnapshot ?? 0;
            return (
              <article key={item._id} className="cart-item">
                <img src={buildImageUrl(product.images?.[0]?.url)} alt={product.title} />
                <div>
                  <h3>{product.title}</h3>
                  <p>{formatCurrency(unitPrice)}</p>
                  <p>Size: {item.selectedSize || '-'}</p>
                  <p>Color: {item.selectedColor || '-'}</p>
                  {item.customization?.customText && <p>Text: {item.customization.customText}</p>}
                  <div className="cart-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItemQuantity(item._id, e.target.value)}
                    />
                    <button type="button" className="text-btn" onClick={() => removeCartItem(item._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="order-summary">
        <h2>Order Summary</h2>
        <p>Subtotal: {formatCurrency(cartSubtotal)}</p>
        <p>Shipping: {formatCurrency(summary.shipping)}</p>
        <h3>Total: {formatCurrency(summary.total)}</h3>

        <label>
          Shipping Address
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Street, City, State"
            rows="4"
          />
        </label>

        <button type="button" className="primary-btn" onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : isAuthenticated ? 'Checkout (Mock Payment)' : 'Login to Checkout'}
        </button>
        {message && <p className="flash-msg">{message}</p>}
      </aside>
    </section>
  );
};

export default CartPage;
