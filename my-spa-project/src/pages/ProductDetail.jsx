import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../contexts/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/products/${id}/`).then((r) => setProduct(r.data)).catch(console.error);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="link-btn">Back</button>
      <h2>{product.name}</h2>
      <img src={product.image_url || "/placeholder.png"} alt={product.name} style={{maxWidth:300}} />
      <p>{product.description}</p>
      <p>Price: RM {product.price}</p>
      <p>Stock: {product.stock}</p>
      <button
        className="btn"
        onClick={() => {
          addToCart(product, 1);
          alert("Added to cart");
        }}
      >
        Add to cart
      </button>
    </div>
  );
}
