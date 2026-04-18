import { useEffect, useState } from "react";
import "./AdminReportsPage.css";

export default function AdminReportsPage() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    fetch("/api/admin/reports/sales/", { credentials: "include" })
      .then((res) => res.json())
      .then(setReport);
  }, []);

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
