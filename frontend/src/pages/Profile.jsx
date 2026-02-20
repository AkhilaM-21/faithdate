import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [viewsData, setViewsData] = useState(null);
  const [favorites, setFavorites] = useState(null); // Favorites State
  const [verifying, setVerifying] = useState(false);

  // Camera Refs & State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    API.get("/users/me").then(res => {
      setUser(res.data);
      setFormData(res.data);
    });
  }, []);

  // const showToast = (msg, type = "success") => {
  //   setToast({ msg, type });
  //   setTimeout(() => setToast(null), 3000);
  // };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      // Convert interests string to array if needed
      if (typeof payload.interests === "string") {
        payload.interests = payload.interests.split(",").map(s => s.trim()).filter(Boolean);
      }
      const res = await API.put("/users/profile", payload);
      setUser(res.data);
      setFormData(res.data);
      setFormData(res.data);
      setActiveSection(null);
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.msg || "Failed to update", "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const current = formData.photos?.length || 0;
    if (current + files.length > 9) {
      return addToast("Maximum 9 photos allowed", "error");
    }
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

  const movePhoto = (index, direction) => {
    const photos = [...formData.photos];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= photos.length) return;
    [photos[index], photos[newIndex]] = [photos[newIndex], photos[index]];
    setFormData({ ...formData, photos });
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



  // ── Camera Logic ──
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      setCameraActive(true);
      setCapturedImage(null);
    } catch (err) {
      console.error(err);
      addToast("Could not access camera", "error");
    }
  };

  // Attach stream to video element once active
  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      // Flip horizontally for mirror effect if using front camera (optional, but good UX)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const submitVerification = async () => {
    if (!capturedImage) return;
    setVerifying(true);
    try {
      const res = await API.post("/users/verify", { selfiePhoto: capturedImage });
      setUser(prev => ({ ...prev, isVerified: true }));
      addToast(res.data.msg, "success");
      setCapturedImage(null);
    } catch (err) {
      addToast(err.response?.data?.msg || "Verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);


  const fetchViews = async () => {
    try {
      const res = await API.get("/users/views");
      setViewsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await API.get("/users/favorites");
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load favorites", "error");
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Toast removed (using global context) */}

      {!activeSection ? (
        <>
          {/* 1. Profile Header */}
          <div className="relative bg-white pb-6 shadow-sm">
            {/* Cover Background */}
            <div className="h-32 w-full bg-gradient-to-r from-rose-400 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Profile Info & Avatar */}
            <div className="px-5 -mt-16 relative z-10 flex flex-col items-center text-center">
              {/* Circular Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-3 relative group">
                <img
                  src={user.photos?.[0]?.url || "https://via.placeholder.com/400"}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Name & Age */}
              <div className="flex items-center gap-2 justify-center mb-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.first_name}, {calculateAge(user.date_of_birth)}
                </h1>
                {user.isVerified && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="Verified">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Location */}
              <p className="text-gray-500 flex items-center gap-1 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {user.location || "Earth"}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 2. About Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">About Me</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{user.bio || "No bio yet."}</p>

              {/* Job & Education */}
              {(user.job || user.education) && (
                <div className="space-y-2 mb-4">
                  {user.job && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">{user.job}</span>
                    </div>
                  )}
                  {user.education && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                      <span className="text-sm font-medium">{user.education}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold text-sm">Looking For:</span>
                <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user.relationship_goal}
                </span>
              </div>
            </div>

            {/* 3. Faith */}
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

            {/* 4. Interests */}
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

            {/* 5. Basic Info + Preferences */}
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
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Age Preference</span>
                  <span className="text-gray-800 font-medium">{user.agePreference?.min || 18} – {user.agePreference?.max || 50} yrs</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Distance</span>
                  <span className="text-gray-800 font-medium">{user.distancePreference || 50} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-800 font-medium">{user.phoneNumber || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* 6. Verification Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Profile Verification</h2>
              {user.isVerified ? (
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-green-700">Verified Profile</p>
                    <p className="text-xs text-green-600">Your identity has been confirmed</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Take a selfie to verify your identity and get a verified badge on your profile.</p>

                  {!cameraActive && !capturedImage && (
                    <button
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Start Verification
                    </button>
                  )}

                  {/* Full Screen Camera Modal */}
                  {cameraActive && (
                    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                      {/* Header */}
                      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                        <div className="text-white">
                          <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Verification Progress</p>
                          <div className="w-32 h-1 bg-white/20 rounded-full mt-1">
                            <div className="w-1/2 h-full bg-pink-500 rounded-full"></div>
                          </div>
                        </div>
                        <button
                          onClick={stopCamera}
                          className="p-2 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      {/* Camera View */}
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                        />

                        {/* Face Guide Overlay */}
                        {/* CSS Face Guide Overlay */}
                        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                          {/* Inner Square */}
                          <div
                            className="w-[60%] aspect-square border-4 border-white rounded-2xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.6)] relative z-20"
                          ></div>

                          {/* Instructions */}
                          <div className="absolute bottom-32 w-full text-center px-10 z-30">
                            <h3 className="text-2xl font-bold text-white mb-2">Face Verification</h3>
                            <p className="text-white/80 text-sm">Position your face within the square.</p>
                          </div>
                        </div>

                        {/* Capture Controls */}
                        <div className="absolute bottom-10 left-0 w-full flex justify-center z-20">
                          <button
                            onClick={capturePhoto}
                            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-2xl active:scale-95 transition-transform flex items-center justify-center"
                          >
                            <div className="w-16 h-16 bg-pink-500 rounded-full border-4 border-white"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Capture Preview Modal */}
                  {capturedImage && (
                    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                      <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover opacity-80" />

                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-8 pb-10">
                        <h3 className="text-white text-xl font-bold mb-6 text-center">Looking good?</h3>
                        <div className="flex gap-4">
                          <button
                            onClick={retakePhoto}
                            className="flex-1 py-4 bg-white/20 text-white font-bold rounded-xl backdrop-blur-md hover:bg-white/30 transition"
                          >
                            Retake
                          </button>
                          <button
                            onClick={submitVerification}
                            disabled={verifying}
                            className="flex-1 py-4 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 transition disabled:opacity-50 flex justify-center items-center gap-2"
                          >
                            {verifying ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Verifying...
                              </>
                            ) : (
                              "Use Photo"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {/* 7. Who Viewed Me */}
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">Who Viewed Me</h2>
                {!viewsData && (
                  <button onClick={fetchViews} className="text-sm font-bold text-pink-500 hover:text-pink-700 transition">
                    Show
                  </button>
                )}
              </div>
              {viewsData ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-gray-800">{viewsData.totalViews}</span>
                    <span className="text-gray-500 text-sm">profile views</span>
                  </div>
                  {viewsData.isPremium ? (
                    viewsData.viewers.length > 0 ? (
                      <div className="space-y-2">
                        {viewsData.viewers.map((v, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                            <img
                              src={v.viewer?.photos?.[0]?.url || "https://via.placeholder.com/40"}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                {v.viewer?.first_name}
                                {v.viewer?.isVerified && <span className="text-blue-500 text-[10px]">✓</span>}
                              </p>
                              <p className="text-xs text-gray-400">{new Date(v.viewedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No viewers yet</p>
                    )
                  ) : (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
                      <p className="text-sm font-bold text-rose-700 mb-1">🔒 Premium Feature</p>
                      <p className="text-xs text-rose-600">Upgrade to see who viewed your profile</p>
                      <button className="mt-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition">
                        Upgrade to Premium
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Tap "Show" to see your profile views</p>
              )}
            </div>

            {/* 8. Gallery */}
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

            {/* 9. Profile Actions */}
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
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Account</h3>

                <button onClick={() => navigate('/community')} className="w-full text-left py-3 border-b border-gray-100 text-gray-700 font-medium flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition">
                  <span>My Posts</span>
                  <span className="text-gray-400">›</span>
                </button>

                <button onClick={() => { setActiveSection('favorites'); fetchFavorites(); }} className="w-full text-left py-3 border-b border-gray-100 text-gray-700 font-medium flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    My Favorites
                  </span>
                  <span className="text-gray-400">›</span>
                </button>

                <button onClick={() => navigate('/settings')} className="w-full text-left py-3 text-gray-700 font-medium flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Account Settings
                  </span>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : activeSection === 'favorites' ? (
        /* ═══════════ Favorites Screen ═══════════ */
        <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Favorites</h1>
            <button onClick={() => setActiveSection(null)} className="text-gray-500 font-medium hover:text-gray-800">Back</button>
          </div>

          {!favorites ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div></div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {favorites.map((fav) => (
                <div key={fav._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative">
                  <div className="h-32 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${fav.photos?.[0]?.url || 'https://via.placeholder.com/150'})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-3 absolute bottom-0 w-full text-white">
                    <p className="font-bold text-sm truncate">{fav.first_name}, {fav.age}</p>
                    <p className="text-[10px] opacity-90 truncate">{fav.location || "Nearby"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Favorites Yet</h3>
              <p className="text-gray-500 text-sm mt-1 px-6">Use the star button on the Discover page to save people here!</p>
            </div>
          )}
        </div>
      ) : activeSection === 'photos' ? (
        /* ═══════════ Photos Edit Screen ═══════════ */
        <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Photos <span className="text-sm text-gray-400 font-medium">({formData.photos?.length || 0}/9)</span></h1>
            <button onClick={() => setActiveSection(null)} className="text-gray-500 font-medium hover:text-gray-800">Done</button>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm">
            {/* Photo Grid with Reorder */}
            <div className="space-y-3">
              {formData.photos?.map((photo, index) => (
                <div key={index} className={`flex gap-3 items-start p-3 rounded-xl ${index === 0 ? "bg-pink-50 border border-pink-100" : "bg-gray-50"}`}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button onClick={() => movePhoto(index, -1)} disabled={index === 0} className={`p-1 rounded ${index === 0 ? "text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <img src={photo.url} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                    <button onClick={() => movePhoto(index, 1)} disabled={index === formData.photos.length - 1} className={`p-1 rounded ${index === formData.photos.length - 1 ? "text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    {index === 0 && <span className="text-[10px] font-bold text-pink-500 uppercase">Main Photo</span>}
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
                    <button onClick={() => removePhoto(index)} className="text-xs text-red-500 font-bold">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Photos */}
            {(formData.photos?.length || 0) < 9 && (
              <div className="pt-4 border-t border-gray-100">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-pink-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-pink-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Add photos ({9 - (formData.photos?.length || 0)} remaining)</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            )}

            <button onClick={handleSave} className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition mt-4">
              Save Photos
            </button>
          </div>
        </div>
      ) : (
        /* ═══════════ Details Edit Screen ═══════════ */
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Interested In</label>
                <select name="interested_in" value={formData.interested_in} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl bg-white">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio || ""} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl h-32 resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">💼 Job Title</label>
                <input type="text" name="job" value={formData.job || ""} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">🎓 Education</label>
                <input type="text" name="education" value={formData.education || ""} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="e.g. MIT" />
              </div>
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

            {/* Age & Distance Preferences */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">🎯 Match Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Min Age</label>
                  <input
                    type="number"
                    min="18" max="99"
                    value={formData.agePreference?.min || 18}
                    onChange={(e) => setFormData({ ...formData, agePreference: { ...formData.agePreference, min: parseInt(e.target.value) || 18 } })}
                    className="w-full border border-gray-200 p-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Max Age</label>
                  <input
                    type="number"
                    min="18" max="99"
                    value={formData.agePreference?.max || 50}
                    onChange={(e) => setFormData({ ...formData, agePreference: { ...formData.agePreference, max: parseInt(e.target.value) || 50 } })}
                    className="w-full border border-gray-200 p-3 rounded-xl"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">Distance Preference: {formData.distancePreference || 50} km</label>
                <input
                  type="range"
                  min="5" max="200" step="5"
                  value={formData.distancePreference || 50}
                  onChange={(e) => setFormData({ ...formData, distancePreference: parseInt(e.target.value) })}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>5 km</span>
                  <span>200 km</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location || ""} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Interests</label>
              <input type="text" name="interests" value={formData.interests} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="Music, Travel, Faith..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="w-full border border-gray-200 p-3 rounded-xl" placeholder="+1 234..." />
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