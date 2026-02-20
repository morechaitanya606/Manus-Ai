import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/services';
import { formatCurrency } from '../utils/format';
import Loader from '../components/ui/Loader';

const DashboardPage = () => {
  const { user, updateProfile, syncUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', address: user.address || '', password: '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        await syncUser();
        const { data } = await orderApi.myOrders({ page: 1, limit: 20 });

        if (Array.isArray(data)) {
          setOrders(data);
          setOrderTotal(data.length);
        } else {
          setOrders(data.data || []);
          setOrderTotal(data.pagination?.total || 0);
        }
      } catch {
        setOrders([]);
        setOrderTotal(0);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const getOrderStatus = (order) => (order.orderStatus || order.status || '').toString();
  const getPaymentStatus = (order) => (
    order.paymentStatus || order.payment?.status || ''
  ).toString();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Profile updated');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <section className="section container dashboard-grid">
      <div className="card-block">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </label>
          <label>
            Address
            <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} rows="3" />
          </label>
          <label>
            New Password (optional)
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Leave blank to keep existing"
              minLength={8}
            />
          </label>
          <button className="primary-btn" type="submit">
            Save Profile
          </button>
          {message && <p className="flash-msg">{message}</p>}
        </form>
      </div>

      <div className="card-block">
        <h2>My Orders</h2>
        {!loadingOrders && <p>Total orders: {orderTotal}</p>}
        {loadingOrders ? (
          <Loader label="Loading orders" />
        ) : (
          <div className="orders-list">
            {orders.length ? (
              orders.map((order) => (
                <article key={order._id} className="order-item">
                  <div>
                    <h4>Order #{(order.orderNumber || order._id.slice(-6)).toString().toUpperCase()}</h4>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p>Total: {formatCurrency(order.totalAmount)}</p>
                    <p>Status: {getOrderStatus(order)}</p>
                    <p>Payment: {getPaymentStatus(order)}</p>
                  </div>
                </article>
              ))
            ) : (
              <p>No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
