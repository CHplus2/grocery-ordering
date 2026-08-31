import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../contexts/UIProvider";
import { useProduct } from "../../contexts/ProductProvider";
import { getCookie } from "../../utils/cookieUtils";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newProduct, setNewProduct] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { fallback_img } = useUI();
  const { categories, products, fetchProducts, setProductIdToDelete, addProduct, updateProduct } = useProduct();
  const navigate = useNavigate();

  const emptyForm = {
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    image_url: "",
  };

  useEffect(() => {
    if (newProduct || updatedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    }
  }, [newProduct, updatedProduct]);

  const validateInput = (product) => {
    if (!product.name || !product.price || !product.stock || !product.category) {
      setAlert("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleAddProduct = async (e) => {
    if (!validateInput(newProduct)) {
      return;
    }

    setLoading(true);

    await addProduct(newProduct);
    
    setNewProduct(null);
    setLoading(false);
  };

  const handleUpdateProduct = async () => {
    if (!validateInput(updatedProduct)) {
      return;
    }

    setLoading(true); 

    await updateProduct(updatedProduct);

    setUpdatedProduct(null);
    setLoading(false);
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
        <h1>Product Management</h1>
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
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="table-img" 
                      onError={(e) => (e.target.src = fallback_img)}
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </td>
                <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category_name}</td>
              <td>
                <button onClick={() => setUpdatedProduct({ ...p })}>Edit</button>
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
      {updatedProduct && (
      <div className="modal-overlay" onClick={() => setUpdatedProduct(null)}>
        <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Update Product</h2>

          <label>Product Name</label>
          <input
            value={updatedProduct.name}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
          />
          <label>Price</label>
          <input
            type="number"
            value={updatedProduct.price}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
          />
          <label>Stock</label>
          <input
            type="number"
            value={updatedProduct.stock}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, stock: e.target.value })}
          />
          <label>Description</label>  
          <textarea
            value={updatedProduct.description}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
          />
          <label>Category</label>
          <select
            value={updatedProduct.category || ""}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: Number(e.target.value) })}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Image URL</label>
          <input
            value={updatedProduct.image_url || ""}
            onChange={(e) =>
              setUpdatedProduct({ ...updatedProduct, image_url: e.target.value })
            }
          />

          {updatedProduct.image_url ? (
            <img
              src={updatedProduct.image_url}
              alt="Preview"
              className="image-preview"
              onError={(e) => (e.target.src = fallback_img)}
            />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}

          <div className="modal-actions">  
            <button onClick={handleUpdateProduct} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setUpdatedProduct(null)}>Cancel</button>
          </div>
        </div>
      </div>
      )}

      {/* Add Product Modal */}
      {newProduct && (
      <div className="modal-overlay" onClick={() => setUpdatedProduct(null)}>
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

          <label>Image URL</label>
          <input
            value={newProduct.image_url}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image_url: e.target.value })
            }
          />

          {newProduct.image_url ? (
            <img
              src={newProduct.image_url}
              alt="Preview"
              className="image-preview"
              onError={(e) => (e.target.src = fallback_img)}
            />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}

          <div className="modal-actions">
            <button onClick={handleAddProduct} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button onClick={() => setNewProduct(null)}>Cancel</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
