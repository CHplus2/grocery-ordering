import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart, products, recommended, categories, fallback_img, formatPrice } = useCart();

  const scrollRef = useRef(null);

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === Number(selectedCategory) : true;
    return matchesName && matchesCategory;
  });

  return (
    <div className="products-page">
      {/* Recommendation */}
      {recommended?.length > 0 && (
        <div className="recommended-section">
          <h2 className="section-title">Based on your activity</h2>

          <div className="recommended-wrapper">
            
            <button 
              className="scroll-btn left"
              onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })}
            >
              ←
            </button>

            <div className="recommended-row" ref={scrollRef}>
              {recommended.slice(0, 10).map((r) => (
                <div key={r.product_id} className="recommended-card">
                  <Link to={`/products/${r.product_id}`} className="product-link">
                    <div className="product-image-wrapper">
                      {r.product_img ? (
                        <img 
                          src={r.product_img} 
                          alt={r.product_name} 
                          className="product-image"
                          onError={(e) => (e.target.src = fallback_img)}
                        />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{r.product_name}</h3>
                      <p className="product-price">{formatPrice(r.product_price)}</p>
                    </div>
                    {r.reasons?.length > 0 && (
                      <div className="recommend-badge">{r.reasons[0]}</div>
                    )}
                  </Link>
                  <button className="add-btn" onClick={() => addToCart(r.product_id)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            <button 
              className="scroll-btn right"
              onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })}
            >
              →
            </button>

          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="browse-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <Link to={`/products/${p.id}`} className="product-link">
                <div className="product-image-wrapper">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="product-image" 
                      onError={(e) => (e.target.src = fallback_img)}
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h2 className="product-title">{p.name}</h2>
                  <p className="product-price">{formatPrice(p.price)}</p>
                </div>
              </Link>
              <button className="add-btn" onClick={() => addToCart(p.id)}>
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </div>
    </div>
  );
}
