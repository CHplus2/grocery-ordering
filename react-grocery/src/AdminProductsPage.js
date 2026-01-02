import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "./utils";
import { useNavigate } from "react-router-dom";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = () => {
    axios.get("/api/categories/").then((res) => setCategories(res.data));
  };

  const fetchProducts = () => {
    axios.get("/api/products/").then((res) => setProducts(res.data));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`/api/admin/products/${id}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    });

    fetchProducts();
  };

  const startEdit = (product) => setEditingProduct({ ...product });

  const saveEdit = async () => {
    await fetch(`/api/admin/products/${editingProduct.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify(editingProduct),
    });

    setEditingProduct(null);
    fetchProducts();
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === Number(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-products-container">
      <div className="admin-header">
        <h1>Admin Product Management</h1>
        <button className="add-product-btn" onClick={() => navigate("/admin/add-product")}>
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="admin-browse-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <p className="no-results">No products found.</p>
      ) : (
        filteredProducts.map((p) => (
          <div key={p.id} className="admin-product-card">
            <div className="admin-card-left">
              {p.image_url && <img src={p.image_url} alt={p.name} className="admin-product-image" />}
            </div>
            <div className="admin-card-right">
              <h3>{p.name}</h3>
              <p className="price">$ {p.price}</p>
              <p className="stock">Stock: {p.stock}</p>
              <p className="desc">{p.description}</p>
              <p className="category">Category: {p.category_name || "None"}</p>

              <div className="admin-btn-row">
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => deleteProduct(p.id)} className="danger">Delete</button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="edit-modal">
          <h2>Edit Product</h2>

          <input
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
          />
          <input
            type="number"
            value={editingProduct.price}
            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
          />
          <input
            type="number"
            value={editingProduct.stock}
            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
          />
          <textarea
            value={editingProduct.description}
            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
          />
          <select
            value={editingProduct.category || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditingProduct(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
