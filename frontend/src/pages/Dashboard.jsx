import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me", {
          headers: {
            Authorization: token
          }
        });

        setUser(res.data);

      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchProfile();

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Welcome, {user.first_name}
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="space-y-2">

          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Interested In:</strong> {user.interested_in}</p>
          <p><strong>Relationship Goal:</strong> {user.relationship_goal}</p>
          <p><strong>Denomination:</strong> {user.denomination}</p>
          <p><strong>Church Involvement:</strong> {user.church_involvement}</p>

        </div>

      </div>

    </div>
  );
}
