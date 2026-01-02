import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/api/products/").then((r) => setProducts(r.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <img src={p.image_url || "/placeholder.png"} alt={p.name} />
            <h3>{p.name}</h3>
            <p>RM {p.price}</p>
            <p>{p.stock} in stock</p>
            <Link to={`/products/${p.id}`} className="btn">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
