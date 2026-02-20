import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/services';
import FilterSidebar from '../components/ui/FilterSidebar';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';
import useDebounce from '../hooks/useDebounce';

const initialFilters = {
  category: '',
  type: '',
  size: '',
  color: '',
  minPrice: '',
  maxPrice: ''
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    category: searchParams.get('category') || ''
  }));
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchText, 450);

  const sortParams = useMemo(() => {
    const [sortBy, order] = sort.split('-');
    return { sortBy, order };
  }, [sort]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          ...filters,
          search: debouncedSearch,
          ...sortParams,
          page,
          limit: 12
        };

        const { data } = await productApi.list(params);
        setProducts(data.data);
        setPagination(data.pagination);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, debouncedSearch, sortParams, page]);

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchText('');
    setPage(1);
  };

  return (
    <section className="section container">
      <div className="page-head">
        <h1>Shop Collection</h1>
        <p>Men, women, and customization-ready essentials.</p>
      </div>

      <div className="catalog-topbar">
        <input
          type="search"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title or style"
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="createdAt-desc">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="catalog-layout">
        <FilterSidebar
          filters={filters}
          setFilters={(updater) => {
            setFilters(updater);
            setPage(1);
          }}
          onClear={clearFilters}
        />

        <div>
          {loading ? (
            <Loader label="Loading catalog" />
          ) : (
            <>
              <p className="result-count">{pagination.total} products found</p>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
