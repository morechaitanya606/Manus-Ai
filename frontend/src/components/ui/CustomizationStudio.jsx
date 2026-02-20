import { useRef } from 'react';

const CustomizationStudio = ({ product, state, onStateChange, quantity, setQuantity, onAddToCart }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onStateChange('customImage', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="customization-panel">
      <h3>Customization Studio</h3>
      <p>Preview your design before adding to cart.</p>

      <div className="studio-grid">
        <div className="preview-shell">
          <div className="garment-preview" style={{ background: state.selectedColor || '#1f2937' }}>
            {state.customImage && <img src={state.customImage} alt="Custom" className="preview-upload" />}
            {state.customText && (
              <span className="preview-text" style={{ color: state.customColor || '#ffffff' }}>
                {state.customText}
              </span>
            )}
          </div>
        </div>

        <div className="studio-controls">
          <label>
            Size
            <select
              value={state.selectedSize}
              onChange={(e) => onStateChange('selectedSize', e.target.value)}
            >
              <option value="">Choose size</option>
              {product.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label>
            Color
            <select
              value={state.selectedColor}
              onChange={(e) => onStateChange('selectedColor', e.target.value)}
            >
              <option value="">Choose color</option>
              {product.colors?.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>

          <label>
            Custom Text
            <input
              type="text"
              maxLength="30"
              value={state.customText}
              onChange={(e) => onStateChange('customText', e.target.value)}
              placeholder="Add your text"
            />
          </label>

          <label>
            Text Color
            <input
              type="color"
              value={state.customColor}
              onChange={(e) => onStateChange('customColor', e.target.value)}
            />
          </label>

          <div className="upload-row">
            <button type="button" className="ghost-btn" onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </button>
            {state.customImage && (
              <button type="button" className="text-btn" onClick={() => onStateChange('customImage', '')}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <label>
            Quantity
            <input
              type="number"
              min="1"
              max={product.stock || 50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>

          <button type="button" className="primary-btn" onClick={onAddToCart}>
            Add Customized Item
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomizationStudio;
