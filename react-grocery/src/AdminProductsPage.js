import axios from "axios";
import { useState } from "react";
import { getCookie } from "./utils";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newProduct, setNewProduct] = useState(false);
  const [editedProduct, setEditedProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { categories, products, fetchProducts, setProductIdToDelete } = useCart();
  const navigate = useNavigate();

  const emptyForm = {
    name: "",
    price: "",
    stock: "",
    description: "",
    category: ""
  };

  const refreshPage = () => {
    setLoading(false);
    fetchProducts();
  }

  const validateInput = (product) => {
    if (!product.name || !product.price || !product.stock || !product.category) {
      setError("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleAddProduct = async (e) => {
    if (!validateInput(newProduct)) {
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/admin/products/add/", newProduct, {
        withCredentials: true,
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      navigate("/admin/products"); 
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add product");
    } finally {
      setNewProduct(null);
      refreshPage();
    }
  };

  const handleEditProduct = async () => {
    if (!validateInput(editedProduct)) {
      return;
    }

    setLoading(true); 

    try {
      await fetch(`/api/admin/products/${editedProduct.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify(editedProduct),
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes");
      return;
    } finally {
      setEditedProduct(null);
      setLoading(false);
      fetchProducts();
    }
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
        <button className="add-product-btn" onClick={() => setNewProduct(emptyForm)}>
          Create Product
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
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.image_url} alt={p.name} className="table-img" />
                </td>
                <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category_name}</td>
              <td>
                <button onClick={() => setEditedProduct({ ...p })}>Edit</button>
                <button
                  className="danger"
                  onClick={() => setProductIdToDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No products found.</td>
            </tr>
          )}

        </tbody>
      </table>

      {/* Edit Product Modal */}
      {editedProduct && (
      <div className="modal-overlay" onClick={() => setEditedProduct(null)}>
        <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Update Product</h2>

          <label>Product Name</label>
          <input
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
          />
          <label>Price</label>
          <input
            type="number"
            value={editedProduct.price}
            onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
          />
          <label>Stock</label>
          <input
            type="number"
            value={editedProduct.stock}
            onChange={(e) => setEditedProduct({ ...editedProduct, stock: e.target.value })}
          />
          <label>Description</label>  
          <textarea
            value={editedProduct.description}
            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
          />
          <label>Category</label>
          <select
            value={editedProduct.category || ""}
            onChange={(e) => setEditedProduct({ ...editedProduct, category: Number(e.target.value) })}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="modal-actions">  
            <button onClick={handleEditProduct} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditedProduct(null)}>Cancel</button>
          </div>
         {error && <p className="error">{error}</p>}
        </div>
      </div>
      )}

      {/* Add Product Modal */}
      {newProduct && (
      <div className="modal-overlay" onClick={() => setEditedProduct(null)}>
        <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Create Product</h2>

          <label>Name</label>
          <input
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />

          <label>Price</label>
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />

          <label>Stock</label>
          <input
            type="number"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />

          <label>Description</label>
          <textarea
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />

          <label>Category</label>
          <select
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: Number(e.target.value) })
            }
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button onClick={handleAddProduct} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button onClick={() => setNewProduct(null)}>Cancel</button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
      )}
    </div>
  );
}
