import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "./utils";
import { useNavigate } from "react-router-dom";
import "./AdminAddProduct.css";

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/categories/")
        .then(res => setCategories(res.data))
        .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/products/add/", form, {
        withCredentials: true,
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      navigate("/admin/products"); // navigate back to admin products page
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <div className="admin-add-container">
      <div className="admin-card">
        <h2 className="admin-title">Add New Product</h2>

        <button 
          className="back-btn"
          onClick={() => navigate("/admin/products")}
        >
          &larr; Back to Admin Products
        </button>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <label>Price (RM)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Stock Quantity</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <label>Image URL</label>
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
          />

          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="category-dropdown"
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {form.image_url && (
            <div className="preview-wrapper">
              <img src={form.image_url} alt="Preview" className="preview-img" />
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="admin-submit-btn">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
