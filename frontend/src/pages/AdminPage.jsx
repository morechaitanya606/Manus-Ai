import { useEffect, useState } from 'react';
import { orderApi, productApi } from '../api/services';
import { CATEGORIES, ORDER_STATUSES, PRODUCT_TYPES } from '../utils/constants';
import { formatCurrency } from '../utils/format';
import Loader from '../components/ui/Loader';

const initialForm = {
  title: '',
  description: '',
  category: 'men',
  type: 'tshirt-oversized',
  price: 0,
  sizes: 'S,M,L,XL',
  colors: 'Black,White,Navy',
  stock: 10,
  tags: 'custom,premium',
  customizable: true,
  images: []
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: productData }, { data: orderData }] = await Promise.all([
        productApi.list({ page: 1, limit: 40, sortBy: 'createdAt', order: 'desc' }),
        orderApi.allOrders({ page: 1, limit: 60 })
      ]);
      setProducts(productData.data || []);
      setOrders(orderData.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      type: product.type,
      price: product.price,
      sizes: (product.sizes || []).join(','),
      colors: (product.colors || []).join(','),
      stock: product.stock,
      tags: (product.tags || []).join(','),
      customizable: product.customizable,
      images: []
    });
    setActiveTab('products');
  };

  const buildProductFormData = () => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('type', form.type);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('sizes', JSON.stringify(form.sizes.split(',').map((x) => x.trim()).filter(Boolean)));
    fd.append('colors', JSON.stringify(form.colors.split(',').map((x) => x.trim()).filter(Boolean)));
    fd.append('tags', JSON.stringify(form.tags.split(',').map((x) => x.trim()).filter(Boolean)));
    fd.append('customizable', form.customizable);

    Array.from(form.images || []).forEach((file) => fd.append('images', file));
    return fd;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const payload = buildProductFormData();
      if (editingId) {
        await productApi.update(editingId, payload);
        setMessage('Product updated');
      } else {
        await productApi.create(payload);
        setMessage('Product created');
      }
      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Save failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Soft delete this product?')) return;

    try {
      await productApi.remove(id);
      setMessage('Product soft deleted');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleManageStock = async (product) => {
    const input = window.prompt(`Update stock for ${product.title}`, String(product.stock));
    if (input === null) return;

    const nextStock = Number(input);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setMessage('Stock must be a non-negative integer');
      return;
    }

    try {
      await productApi.updateStock(product._id, nextStock);
      setMessage('Stock updated');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Stock update failed');
    }
  };

  const handleOrderStatusChange = async (orderId, orderStatus) => {
    try {
      await orderApi.updateStatus(orderId, { orderStatus });
      setMessage('Order status updated');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Order update failed');
    }
  };

  const getOrderStatus = (order) => (order.orderStatus || order.status || '').toString();
  const getPaymentStatus = (order) =>
    (order.paymentStatus || order.payment?.status || '').toString();

  if (loading) return <Loader label="Loading admin panel" />;

  return (
    <section className="section container admin-layout">
      <div className="admin-tabs">
        <button type="button" onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>
          Products
        </button>
        <button type="button" onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>
          Orders
        </button>
      </div>

      {message && <p className="flash-msg">{message}</p>}

      {activeTab === 'products' ? (
        <div className="admin-grid">
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <label>
              Title
              <input type="text" value={form.title} onChange={(e) => handleFieldChange('title', e.target.value)} required />
            </label>
            <label>
              Description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                required
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => handleFieldChange('category', e.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => handleFieldChange('type', e.target.value)}>
                {PRODUCT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="inline-two">
              <label>
                Price
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleFieldChange('stock', e.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Sizes (comma separated)
              <input type="text" value={form.sizes} onChange={(e) => handleFieldChange('sizes', e.target.value)} />
            </label>
            <label>
              Colors (comma separated)
              <input type="text" value={form.colors} onChange={(e) => handleFieldChange('colors', e.target.value)} />
            </label>
            <label>
              Tags (comma separated)
              <input type="text" value={form.tags} onChange={(e) => handleFieldChange('tags', e.target.value)} />
            </label>
            <label>
              Product Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFieldChange('images', e.target.files)}
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.customizable}
                onChange={(e) => handleFieldChange('customizable', e.target.checked)}
              />
              Customizable product
            </label>
            <div className="inline-two">
              <button type="submit" className="primary-btn">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" className="ghost-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {products.map((product) => (
              <article key={product._id} className="admin-item">
                <div>
                  <h4>{product.title}</h4>
                  <p>
                    {product.category} · {product.type} · {formatCurrency(product.price)} · Stock {product.stock}
                  </p>
                </div>
                <div className="admin-item-actions">
                  <button type="button" className="ghost-btn" onClick={() => handleManageStock(product)}>
                    Stock
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  <button type="button" className="text-btn" onClick={() => handleDeleteProduct(product._id)}>
                    Soft Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-orders">
          {orders.length ? (
            orders.map((order) => (
              <article key={order._id} className="order-item admin-order-item">
                <div>
                  <h4>Order #{(order.orderNumber || order._id.slice(-6)).toString().toUpperCase()}</h4>
                  <p>User: {order.userId?.name || 'Unknown'}</p>
                  <p>Email: {order.userId?.email || '-'}</p>
                </div>
                <div>
                  <p>{formatCurrency(order.totalAmount)}</p>
                  <p>Payment: {getPaymentStatus(order)}</p>
                  <select
                    value={getOrderStatus(order)}
                    onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminPage;
