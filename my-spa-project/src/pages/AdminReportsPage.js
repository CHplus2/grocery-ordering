import { useEffect, useState } from "react";
import { fetchSalesReport } from "../api/api";
import "./AdminReportsPage.css";

export default function AdminReportsPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesReport()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading report...</p>;

  return (
    <div className="admin-reports-container">
      <h1>Product Sales Report</h1>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Total Sold</th>
            <th>Total Revenue (RM)</th>
          </tr>
        </thead>
        <tbody>
          {report.map((item) => (
            <tr key={item.product__id}>
              <td>{item.product_name}</td>
              <td>{item.total_quantity}</td>
              <td>{item.total_revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
