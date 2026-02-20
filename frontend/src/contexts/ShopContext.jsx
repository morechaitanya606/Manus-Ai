import { createContext, useContext, useEffect, useState } from 'react';
import { userApi } from '../api/services';
import { useAuth } from './AuthContext';

const ShopContext = createContext(null);

const cartStorageKey = 'fashion_cart_guest';
const wishlistStorageKey = 'fashion_wishlist_guest';

const readLocalJson = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const makeGuestCartId = ({ productId, selectedSize, selectedColor, customText, customColor, customImage }) =>
  `${productId}_${selectedSize || 'nosize'}_${selectedColor || 'nocolor'}_${customText || 'notext'}_${customColor || 'nocolortext'}_${(
    customImage || 'noimg'
  ).slice(0, 20)}`;

export const ShopProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => readLocalJson(cartStorageKey));
  const [wishlist, setWishlist] = useState(() => readLocalJson(wishlistStorageKey));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
      localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
    }
  }, [cart, wishlist, isAuthenticated]);

  const syncServerState = async () => {
    if (!isAuthenticated) return;

    setSyncing(true);
    try {
      const { data } = await userApi.getProfile();
      setWishlist(data.wishlist || []);
      setCart(data.cart || []);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      syncServerState();
    } else {
      setCart(readLocalJson(cartStorageKey));
      setWishlist(readLocalJson(wishlistStorageKey));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isWishlisted = (productId) =>
    wishlist.some((item) => String(item._id || item) === String(productId));

  const toggleWishlist = async (product) => {
    const productId = product?._id || product;
    const exists = isWishlisted(productId);

    if (isAuthenticated) {
      if (exists) {
        const { data } = await userApi.removeWishlist(productId);
        setWishlist(data);
      } else {
        const { data } = await userApi.addWishlist(productId);
        setWishlist(data);
      }
      return;
    }

    setWishlist((prev) => {
      if (exists) {
        return prev.filter((item) => String(item._id || item) !== String(productId));
      }
      return [...prev, product];
    });
  };

  const addToCart = async ({ product, quantity = 1, selectedSize = '', selectedColor = '', customization = {} }) => {
    const payload = {
      productId: product._id,
      quantity,
      selectedSize,
      selectedColor,
      customization
    };

    if (isAuthenticated) {
      const { data } = await userApi.addCart(payload);
      setCart(data);
      return;
    }

    const customText = customization.customText || '';
    const customImage = customization.customImage || '';

    const guestId = makeGuestCartId({
      productId: product._id,
      selectedSize,
      selectedColor,
      customText,
      customColor: customization.customColor || '',
      customImage
    });

    setCart((prev) => {
      const existing = prev.find((item) => item._id === guestId);
      if (existing) {
        return prev.map((item) =>
          item._id === guestId ? { ...item, quantity: item.quantity + Number(quantity) } : item
        );
      }

      return [
        ...prev,
        {
          _id: guestId,
          product,
          quantity: Number(quantity),
          selectedSize,
          selectedColor,
          customization: {
            customText,
            customColor: customization.customColor || '',
            customImage
          }
        }
      ];
    });
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity));

    if (isAuthenticated) {
      const { data } = await userApi.updateCart(itemId, safeQuantity);
      setCart(data);
      return;
    }

    setCart((prev) => prev.map((item) => (item._id === itemId ? { ...item, quantity: safeQuantity } : item)));
  };

  const removeCartItem = async (itemId) => {
    if (isAuthenticated) {
      const { data } = await userApi.removeCart(itemId);
      setCart(data);
      return;
    }

    setCart((prev) => prev.filter((item) => item._id !== itemId));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await userApi.clearCart();
    }
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || item.priceSnapshot || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = {
    cart,
    wishlist,
    syncing,
    cartSubtotal,
    isWishlisted,
    toggleWishlist,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    syncServerState
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};
