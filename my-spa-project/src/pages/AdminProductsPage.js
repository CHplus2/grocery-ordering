import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts,
  deleteProductAdmin,
  updateProduct,
  addProductAdmin,
  fetchCategories,
} from "../api/api";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProductAdmin(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingProduct?.id) return alert("Product ID missing!");
    try {
      await updateProduct({
        id: editingProduct.id,
        name: editingProduct.name || "",
        price: parseFloat(editingProduct.price) || 0,
        stock: parseInt(editingProduct.stock) || 0,
        description: editingProduct.description || "",
        category: editingProduct.category ? parseInt(editingProduct.category) : null,
        image_url: editingProduct.image_url || "",
      });
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save new product
  const handleAddProduct = async () => {
    try {
      await addProductAdmin({
        name: editingProduct.name || "",
        price: parseFloat(editingProduct.price) || 0,
        stock: parseInt(editingProduct.stock) || 0,
        description: editingProduct.description || "",
        category: editingProduct.category ? parseInt(editingProduct.category) : null,
        image_url: editingProduct.image_url || "",
      });
      setAddingProduct(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === Number(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-products-container">
      <div className="admin-header">
        <h1>Admin Product Management</h1>
        <button onClick={() => { setAddingProduct(true); setEditingProduct({}); }}>
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="admin-browse-controls">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        filteredProducts.map((p) => (
          <div key={p.id} className="admin-product-card">
            {p.image_url && <img src={p.image_url} alt={p.name} className="admin-product-image" />}
            <div className="admin-card-right">
              <h3>{p.name}</h3>
              <p>Price: $ {p.price}</p>
              <p>Stock: {p.stock}</p>
              <p>{p.description}</p>
              <p>Category: {p.category_name || "None"}</p>
              <div className="admin-btn-row">
                <button onClick={() => setEditingProduct(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)} className="danger">Delete</button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal for Edit */}
      {editingProduct && !addingProduct && (
        <div className="edit-modal">
          <h2>Edit Product</h2>
          <input
            placeholder="Name"
            value={editingProduct.name || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={editingProduct.price || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={editingProduct.stock || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={editingProduct.description || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
          />
          {editingProduct.image_url && (
            <img
              src={editingProduct.image_url}
              alt={editingProduct.name}
              className="admin-product-image"
            />
          )}
          <input
            type="text"
            placeholder="Image URL"
            value={editingProduct.image_url || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
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

          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={() => setEditingProduct(null)}>Cancel</button>
        </div>
      )}

      {/* Modal for Add */}
      {addingProduct && (
        <div className="edit-modal">
          <h2>Add Product</h2>
          <input
            placeholder="Name"
            value={editingProduct.name || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={editingProduct.price || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={editingProduct.stock || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={editingProduct.description || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={editingProduct.image_url || ""}
            onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
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

          <button onClick={handleAddProduct}>Add</button>
          <button onClick={() => { setAddingProduct(false); setEditingProduct(null); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
