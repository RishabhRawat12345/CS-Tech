import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [lists, setLists] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const token = localStorage.getItem("token");

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file format. Only CSV, XLS, XLSX are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Get agent data from localStorage
    const userData = JSON.parse(localStorage.getItem("userdata"));
    if (!userData || !userData.agent) {
      setError("Agent not found. Please login again.");
      return;
    }

    setUsername(userData.agent.firstName || userData.agent.email);
    setUseremail(userData.agent.email);

    formData.append("agentId", userData.agent.id);

    try {
      // Upload file
      await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Fetch distributed lists
      const res = await axios.get(
        "http://localhost:5000/api/files/distributed",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data);
      setLists(Array.isArray(res.data.distributions) ? res.data.distributions : []);
      setSuccess("✅ File uploaded and distributed successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setLists([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Upload & Distribute List
      </h2>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow-md max-w-lg mb-10 flex flex-col gap-4 mx-auto"
      >
        <label className="font-semibold text-gray-700">Choose File</label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Upload
        </button>

        {error && <p className="text-red-500 font-medium">{error}</p>}
        {success && <p className="text-green-600 font-medium">{success}</p>}
      </form>

      {/* Distributed Lists */}
      <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Distributed Lists
      </h3>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {lists.length === 0 && (
          <p className="text-gray-500 italic text-center">No lists distributed yet.</p>
        )}

        {lists.map((d, index) => (
          <div
            key={d._id || index}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100"
          >
            {/* Agent Info */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700">
                Agent: {d.agent?.name || "No Name"}
              </h4>
              <p className="text-sm text-gray-500">Email: {d.agent?.email || "No Email"}</p>
              <p className="text-sm text-gray-500">Phone: {d.agent?.phone || "No Phone"}</p>
            </div>

            {/* List Items */}
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-2">
              {Array.isArray(d.items) && d.items.length > 0 ? (
                d.items.map((item, i) => (
                  <div
                    key={item._id || i}
                    className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-700">
                      {item.firstName || "Unnamed"}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {item.phone}{" "}
                      <span className="italic text-gray-400">({item.notes})</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No items assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
