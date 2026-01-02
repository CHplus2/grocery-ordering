import { useEffect, useState } from "react";
import { fetchCustomers, toggleCustomerActive } from "../api/api";
import "./AdminCustomersPage.css";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(console.error);
  }, []);

  const handleToggle = async (customer) => {
    try {
      const updated = await toggleCustomerActive(
        customer.id,
        !customer.is_active
      );

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, is_active: updated.is_active } : c
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="admin-customers-container">
      <h1>Manage Customers</h1>

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Active</th>
            <th>Admin</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.username}</td>
              <td>{c.is_active ? "Yes" : "No"}</td>
              <td>{c.is_staff ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleToggle(c)}>
                  {c.is_active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
