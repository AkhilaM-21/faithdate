import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex justify-around p-4 bg-pink-500 text-white">
      <Link to="/discover">Discover</Link>
      <Link to="/matches">Matches</Link>
      <Link to="/profile">Profile</Link>
    </div>
  );
}
