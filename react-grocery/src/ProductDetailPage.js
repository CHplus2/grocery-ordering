import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "./CartContext";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get(`/api/products/${id}/`)
      .then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail-container">
      
      {/* LEFT: IMAGE */}
      <div className="product-detail-left">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-detail-image"
          />
        )}
      </div>

      {/* RIGHT: INFO */}
      <div className="product-detail-right">
        <h1 className="detail-title">{product.name}</h1>

        {/*<div className="ai-summary">
          {product.ai_summary}
        </div>*/}

        <p className="detail-description">{product.description}</p>

        <div className="price">
          RM {product.price}
        </div>

        <div className="meta">
          <span>Stock: {product.stock}</span>
          <span>Category: {product.category_name}</span>
        </div>

        <button
          onClick={() => addToCart(product.id)}
          className="add-btn"
        >
          Add to Cart
        </button>
      </div>

    </div>
  );
}
