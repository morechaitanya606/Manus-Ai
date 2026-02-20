import { CATEGORIES, COLORS, PRODUCT_TYPES, SIZES } from '../../utils/constants';

const FilterSidebar = ({ filters, setFilters, onClear }) => {
  const update = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button type="button" onClick={onClear} className="text-btn">
          Reset
        </button>
      </div>

      <label>
        Category
        <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Type
        <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">All</option>
          {PRODUCT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Size
        <select value={filters.size} onChange={(e) => update('size', e.target.value)}>
          <option value="">Any</option>
          {SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <label>
        Color
        <select value={filters.color} onChange={(e) => update('color', e.target.value)}>
          <option value="">Any</option>
          {COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </label>

      <label>
        Min Price
        <input
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(e) => update('minPrice', e.target.value)}
          placeholder="0"
        />
      </label>

      <label>
        Max Price
        <input
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
          placeholder="250"
        />
      </label>
    </aside>
  );
};

export default FilterSidebar;
