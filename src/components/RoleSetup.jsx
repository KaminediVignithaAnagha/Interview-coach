import { useState } from "react";

export default function RoleSetup({ onStart, isLoading }) {
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!role.trim()) {
      setError("Type a job role to get started.");
      return;
    }
    setError("");
    onStart(role.trim());
  }

  return (
    <div className="panel">
      <form className="role-form" onSubmit={handleSubmit}>
        <label htmlFor="role">Which role are you practicing for?</label>
        <input
          id="role"
          type="text"
          placeholder="e.g. Frontend Developer, Product Manager"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isLoading}
        />
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Generating questions..." : "Start mock interview"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
