import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    API.get("/users/me")
      .then(res => {
        setUser(res.data);
        setFormData(res.data);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      await API.delete("/users");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      const res = await API.put("/users/profile", payload);
      setUser(res.data);
      setFormData(res.data);
      setActiveSection(null);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), { url: reader.result, caption: "", location: "" }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpdate = (index, field, value) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value };
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const makePrimary = (index) => {
    const updatedPhotos = [...formData.photos];
    const [selected] = updatedPhotos.splice(index, 1);
    updatedPhotos.unshift(selected);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const removePhoto = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {!activeSection ? (
        <>
          {/* 1. Profile Header Section */}
          <div className="relative bg-white pb-6 shadow-sm">
            <div className="h-72 w-full bg-gray-200 relative overflow-hidden">
              <img 
                src={user.photos?.[0]?.url || "https://via.placeholder.com/400"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-5 pt-20">
                <h1 className="text-3xl font-bold text-white drop-shadow-md">
                  {user.first_name}, {calculateAge(user.date_of_birth)}
                </h1>
                <p className="text-white/90 flex items-center gap-1 text-sm font-medium drop-shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {user.location}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 2. About Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">About Me</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{user.bio || "No bio yet."}</p>
              
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold text-sm">Looking For:</span>
                <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user.relationship_goal}
                </span>
              </div>
            </div>

            {/* 3. Faith Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Faith</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Denomination</p>
                  <p className="text-gray-800 font-semibold">{user.denomination}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Involvement</p>
                  <p className="text-gray-800 font-semibold">{user.church_involvement}</p>
                </div>
              </div>
            </div>

            {/* 4. Interests Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.interests?.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. Basic Details */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Basic Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Gender</span>
                  <span className="text-gray-800 font-medium">{user.gender}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Interested In</span>
                  <span className="text-gray-800 font-medium">{user.interested_in}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-800 font-medium">{user.phoneNumber || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* 6. My Gallery (Instagram Style) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">My Gallery</h2>
              <div className="space-y-6">
                {user.photos?.map((photo, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <img src={photo.url} alt="Post" className="w-full h-auto" />
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-gray-800">{user.first_name}</span>
                        {photo.location && <span className="text-xs text-gray-500">• {photo.location}</span>}
                      </div>
                      <p className="text-sm text-gray-700">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Profile Actions */}
            <div className="pt-2 space-y-4">
              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveSection('details')}
                  className="flex-1 bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition active:scale-[0.98]"
                >
                  Edit Details
                </button>
                <button 
                  onClick={() => setActiveSection('photos')}
                  className="flex-1 bg-white text-pink-600 border-2 border-pink-600 font-bold py-4 rounded-xl shadow-lg hover:bg-pink-50 transition active:scale-[0.98]"
                >
                  Edit Photos
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm space-y-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Account Settings</h3>
                
                <button onClick={() => navigate('/community')} className="w-full text-left py-3 border-b border-gray-100 text-gray-700 font-medium flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition">
                  <span>My Posts</span>
                  <span className="text-gray-400">›</span>
                </button>

                <button onClick={handleLogout} className="w-full text-left py-3 border-b border-gray-100 text-gray-700 font-medium flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition">
                  <span>Logout</span>
                  <span className="text-gray-400">›</span>
                </button>
                
                <button onClick={handleDelete} className="w-full text-left py-3 text-red-500 font-medium flex justify-between items-center hover:bg-red-50 px-2 rounded-lg transition">
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : activeSection === 'photos' ? (
        /* Photos Edit Screen */
        <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Photos</h1>
            <button onClick={() => setActiveSection(null)} className="text-gray-500 font-medium hover:text-gray-800">Done</button>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm">
            {/* Main Profile Photo */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Main Profile Photo</h3>
              <p className="text-xs text-gray-500 mb-3">This is the first photo people see.</p>
              {formData.photos && formData.photos.length > 0 ? (
                <div className="flex gap-3 items-start bg-pink-50 p-3 rounded-xl border border-pink-100">
                  <img src={formData.photos[0].url} alt="Main" className="w-24 h-24 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      placeholder="Caption..." 
                      value={formData.photos[0].caption || ""} 
                      onChange={(e) => handlePhotoUpdate(0, 'caption', e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg"
                    />
                    <input 
                      type="text" 
                      placeholder="Location..." 
                      value={formData.photos[0].location || ""} 
                      onChange={(e) => handlePhotoUpdate(0, 'location', e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg"
                    />
                    <button onClick={() => removePhoto(0)} className="text-xs text-red-500 font-bold">Remove</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-500 italic">No profile photo set.</p>
              )}
            </div>

            {/* Gallery */}
            <div>
              <h3 className="font-bold text-gray-800 mb-2 mt-6">Gallery</h3>
              <div className="space-y-4">
                {formData.photos?.slice(1).map((photo, i) => {
                  const index = i + 1;
                  return (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                    <img src={photo.url} alt="Gallery" className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        placeholder="Caption..." 
                        value={photo.caption || ""} 
                        onChange={(e) => handlePhotoUpdate(index, 'caption', e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg"
                      />
                      <input 
                        type="text" 
                        placeholder="Location..." 
                        value={photo.location || ""} 
                        onChange={(e) => handlePhotoUpdate(index, 'location', e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg"
                      />
                      <button onClick={() => makePrimary(index)} className="text-xs text-blue-500 font-bold mr-2">Make Primary</button>
                      <button onClick={() => removePhoto(index)} className="text-xs text-red-500 font-bold">Remove</button>
                    </div>
                  </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-pink-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-pink-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Click to upload photos</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <button onClick={handleSave} className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition mt-4">
              Save Photos
            </button>
          </div>
        </div>
      ) : (
        /* Details Edit Screen */
        <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Details</h1>
            <button onClick={() => setActiveSection(null)} className="text-gray-500 font-medium hover:text-gray-800">Cancel</button>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="+1 234..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl h-32 resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Relationship Goal</label>
              <select name="relationship_goal" value={formData.relationship_goal} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl bg-white">
                <option value="Marriage">Marriage</option>
                <option value="Long-term">Long-term</option>
                <option value="Dating">Dating</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Denomination</label>
                <select name="denomination" value={formData.denomination} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl bg-white">
                  <option value="Catholic">Catholic</option>
                  <option value="Protestant">Protestant</option>
                  <option value="Orthodox">Orthodox</option>
                  <option value="Non-denominational">Non-denom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Involvement</label>
                <select name="church_involvement" value={formData.church_involvement} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl bg-white">
                  <option value="Very Active">Very Active</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Interests</label>
              <input type="text" name="interests" value={formData.interests} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="Music, Travel, Faith..." />
            </div>

            <button onClick={handleSave} className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition mt-4">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}