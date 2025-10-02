import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userdata"); // optional if you store user info
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between fixed h-screen">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h2>

          <nav className="flex flex-col gap-3">
            <Link
              to="agents"
              className={`px-4 py-2 rounded transition ${
                location.pathname.includes("agents")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              Manage Agents
            </Link>

            <Link
              to="upload"
              className={`px-4 py-2 rounded transition ${
                location.pathname.includes("upload")
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            >
              Upload & Distribute Lists
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition shadow-sm"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
