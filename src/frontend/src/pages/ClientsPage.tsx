import { useClients } from "../hooks/useData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientsPage() {
  const { clients, loading, addClient, deleteClient } = useClients();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const navigate = useNavigate();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addClient({ name, email, phone, company });
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text-primary)" }}>
        Clienti
      </h1>

      <form
        onSubmit={handleAdd}
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          backgroundColor: "var(--bg-secondary)",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--border)",
        }}
      >
        <input
          placeholder="Nome*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 2, minWidth: 150 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 2, minWidth: 150 }}
        />
        <input
          placeholder="Telefono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          placeholder="Azienda"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{ flex: 1, minWidth: 120 }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--accent-primary)",
            color: "#fff",
            borderRadius: "0.375rem",
            fontWeight: 600,
          }}
        >
          Aggiungi
        </button>
      </form>

      {loading && <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>Caricamento...</p>}

      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-tertiary)" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nome
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Telefono
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Azienda
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c: any) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--glass)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "0.75rem", color: "var(--text-primary)" }}>{c.name}</td>
                <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{c.email}</td>
                <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{c.phone}</td>
                <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{c.company}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button
                    onClick={() => navigate(`/tasks?client=${c.id}`)}
                    style={{
                      marginRight: 4,
                      padding: "0.3rem 0.6rem",
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      borderRadius: "0.25rem",
                      fontSize: "0.8125rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Task
                  </button>
                  <button
                    onClick={() => deleteClient(c.id)}
                    style={{
                      padding: "0.3rem 0.6rem",
                      backgroundColor: "transparent",
                      color: "var(--danger)",
                      borderRadius: "0.25rem",
                      fontSize: "0.8125rem",
                      border: "1px solid var(--danger)",
                    }}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Nessun cliente trovato.
          </div>
        )}
      </div>
    </div>
  );
}
