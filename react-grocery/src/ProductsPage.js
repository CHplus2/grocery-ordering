import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    axios.get("/api/categories/").then((res) => setCategories(res.data));
  }, []);

  const fetchProducts = () => {
    axios.get("/api/products/").then((res) => setProducts(res.data));
  };

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === Number(selectedCategory) : true;
    return matchesName && matchesCategory;
  });

  return (
    <div className="products-page">
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
                    <img src={p.image_url} alt={p.name} className="product-image" />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h2 className="product-title">{p.name}</h2>
                  <p className="product-price">$ {p.price}</p>
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
