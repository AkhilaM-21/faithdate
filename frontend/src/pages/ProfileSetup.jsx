import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: "",
    job: "",
    education: "",
    relationship_goal: "Marriage",
    denomination: "",
    church_involvement: "Moderate",
    location: "",
    interests: "",
    photos: [],
    gender: "Male",
    interested_in: "Female",
    date_of_birth: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          photos: [...prev.photos, { url: reader.result, caption: "", location: "" }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      interests: form.interests.split(",").map((s) => s.trim())
    };

    try {
      await API.put("/users/profile", payload);
      navigate("/discover");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center py-10 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100 animate-fade-in">
        <h2 className="text-3xl font-bold text-pink-600 mb-2 text-center">Welcome!</h2>
        <p className="text-gray-500 text-center mb-6">Let's set up your profile to find your match.</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Interested In</label>
              <select name="interested_in" value={form.interested_in} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50" />
          </div>

          {/* Faith & Goals */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Relationship Goal</label>
            <select name="relationship_goal" value={form.relationship_goal} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50">
              <option value="Marriage">Marriage</option>
              <option value="Long-term">Long-term Relationship</option>
              <option value="Dating">Dating</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Denomination</label>
            <select name="denomination" value={form.denomination} onChange={handleChange} required className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50">
              <option value="">Select...</option>
              <option value="Catholic">Catholic</option>
              <option value="Protestant">Protestant</option>
              <option value="Orthodox">Orthodox</option>
              <option value="Non-denominational">Non-denominational</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Church Involvement</label>
            <select name="church_involvement" value={form.church_involvement} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50">
              <option value="Very Active">Very Active</option>
              <option value="Moderate">Moderate</option>
              <option value="Occasional">Occasional</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location (City)</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} required placeholder="e.g. New York, NY" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} required placeholder="Tell us about yourself..." className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50 h-24 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">💼 Job Title</label>
              <input type="text" name="job" value={form.job} onChange={handleChange} placeholder="e.g. Designer" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">🎓 Education</label>
              <input type="text" name="education" value={form.education} onChange={handleChange} placeholder="e.g. UCLA" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Interests (comma separated)</label>
            <input type="text" name="interests" value={form.interests} onChange={handleChange} placeholder="Music, Hiking, Reading" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-50" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Profile Photos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img src={photo.url} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">×</button>
                </div>
              ))}
            </div>

            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full border border-gray-200 p-3 rounded-xl text-sm" />
            <p className="text-xs text-gray-400 mt-1">First photo will be your main profile picture.</p>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 mt-4">
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}