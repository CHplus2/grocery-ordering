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
    <div className="product-detail">
      {product.image_url && (
        <img src={product.image_url} alt={product.name} className="product-detail-image" />
      )}

      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p><strong>Price:</strong> RM {product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Category:</strong> {product.category_name}</p>

      <button onClick={() => addToCart(product.id)} className="add-btn">
        Add to Cart
      </button>
    </div>
  );
}
