import { useEffect, useState } from "react";
import axios from "axios";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ firstName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/agents/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgents(res.data.agents || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load agents.");
      }
    };
    fetchAgents();
  }, [token]);

  // Add new agent
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.firstName || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/agents/create",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newAgent = res.data.agent;
      setAgents((prev) => [...prev, newAgent]);
      setForm({ firstName: "", email: "", phone: "", password: "" });
      setSuccess("✅ Agent added successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add agent.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Manage Agents</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleAdd}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Agent</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Agent Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Agent Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Add Agent
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg border border-green-200">
              {success}
            </p>
          )}
        </form>

        {/* Agents List */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Agent List</h3>
          <div className="max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {Array.isArray(agents) && agents.length > 0 ? (
                agents.map((a) => (
                  <li
                    key={a._id}
                    className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.email}</p>
                    </div>
                    <span className="text-sm text-gray-400">{a.phone}</span>
                  </li>
                ))
              ) : (
                <li className="py-4 text-gray-500 text-center">
                  No agents found.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
