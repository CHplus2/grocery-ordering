import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../api/api";
import axios from "axios";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/spa/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1); 
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="product-detail-image" />
        ) : (
          <div className="no-image">No Image</div>
        )}

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p><strong>Price:</strong> RM {product.price}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Category:</strong> {product.category_name}</p>

          <button className="add-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
