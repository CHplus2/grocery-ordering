import { useEffect, useState } from "react";
import { getCookie } from "./utils";
import "./AdminCustomersPage.css"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/customers/", { credentials: "include" })
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  const toggleActive = async (customer) => {
    const res = await fetch(`/api/admin/customers/${customer.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
      credentials: "include",
      body: JSON.stringify({ is_active: !customer.is_active }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    const updatedCustomer = await res.json();

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id ? { ...c, is_active: updatedCustomer.is_active } : c
      )
    );
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
                <button onClick={() => toggleActive(c)}>
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
