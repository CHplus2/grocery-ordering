import React, { useEffect, useState } from "react";
import { fetchProducts, fetchCategories, addToCart } from "../api/api";
import { Link } from "react-router-dom";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setProducts(await fetchProducts());
      setCategories(await fetchCategories());
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory ? p.category === Number(selectedCategory) : true)
  );

  const handleAdd = async (id) => {
    try {
      await addToCart(id, 1);
    } catch {
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="products-page">
      <div className="browse-controls">
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <Link to={`/product/${p.id}`}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="product-image" />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <h3>{p.name}</h3>
                <p>RM {p.price}</p>
              </Link>
              <button className="add-btn" onClick={() => handleAdd(p.id)}>
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
