import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [step, setStep] = useState(1); // For multi-step form
  const totalSteps = 3;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(step => Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(step => Math.max(step - 1, 1));

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Create User (email/password)
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Upload Profile Picture
      let photoURL = "";
      if (data.displayPicture?.[0]) {
        const storageRef = ref(storage, `profilePictures/${uuidv4()}`);
        await uploadBytes(storageRef, data.displayPicture[0]);
        photoURL = await getDownloadURL(storageRef);
      }

      // 3. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: data.fullName,
        photoURL: photoURL,
      });

      // 4. Save Additional User Data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: data.fullName,
        username: data.username,
        age: data.age,
        gender: data.gender,
        email: data.email,
        contact: data.contact || "",
        languages: data.languages,
        countryCity: data.countryCity,
        bio: data.bio,
        photoURL: photoURL,
        createdAt: new Date(),
      });

      // Show success popup instead of alert
      setSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setErrorModalOpen(true);
    }
    setLoading(false);
  };

  // State for modals
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Progress indicator
  const ProgressBar = () => (
    <div className="flex justify-between mb-8 relative">
      <div className="absolute top-1/2 h-0.5 bg-gray-700 w-full -z-10 transform -translate-y-1/2"></div>
      {[...Array(totalSteps)].map((_, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            idx + 1 === step ? 'bg-purple-600 text-white' : 
            idx + 1 < step ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            {idx + 1 < step ? '✓' : idx + 1}
          </div>
          <span className="text-xs mt-1 text-gray-400">
            {idx === 0 ? 'Basic Info' : idx === 1 ? 'Account' : 'Profile'}
          </span>
        </div>
      ))}
    </div>
  );

  // Success Modal
  const SuccessModal = () => (
    successModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-green-500 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Account Created!</h3>
            <p className="text-gray-300 text-center mb-6">Your account has been successfully created. You can now log in.</p>
            <a 
              href="/login" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300 text-center"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  );

  // Error Modal
  const ErrorModal = () => (
    errorModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-red-500 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Oops!</h3>
            <p className="text-gray-300 text-center mb-6">{errorMessage}</p>
            <button 
              onClick={() => setErrorModalOpen(false)}
              className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  );

  const InputField = ({ label, name, type = "text", validation = {}, options = [], placeholder = "" }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {type === "select" ? (
        <select 
          {...register(name, validation)} 
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea 
          {...register(name, validation)} 
          placeholder={placeholder}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 h-24 resize-none"
        />
      ) : type === "multiselect" ? (
        <div>
          <select 
            multiple 
            {...register(name, validation)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 h-24"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
      ) : (
        <input 
          type={type}
          placeholder={placeholder}
          {...register(name, validation)} 
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
        />
      )}
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-gray-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">Join <span className="text-purple-400">Our Community</span></h2>
          <p className="text-gray-400 text-center mb-8">Create your account and start connecting with people around the world</p>
          
          <ProgressBar />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Profile picture preview */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-32 h-32 mb-3 group">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-32 h-32 rounded-full object-cover border-2 border-purple-500 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 shadow-lg">
                        <span className="text-gray-400 text-4xl">👤</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                  <label className="flex items-center justify-center px-4 py-2 bg-purple-600 bg-opacity-80 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition duration-300 w-full max-w-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{previewUrl ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      {...register('displayPicture')} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Full Name" 
                    name="fullName" 
                    validation={{ required: "Full name is required" }}
                    placeholder="Enter your full name"
                  />
                  
                  <InputField 
                    label="Username" 
                    name="username" 
                    validation={{ required: "Username is required" }}
                    placeholder="Choose a unique username"
                  />
                  
                  <InputField 
                    label="Age" 
                    name="age" 
                    type="number" 
                    validation={{ 
                      required: "Age is required", 
                      min: { value: 13, message: "Must be at least 13 years old" } 
                    }}
                    placeholder="Your age"
                  />
                  
                  <InputField 
                    label="Gender" 
                    name="gender" 
                    type="select" 
                    validation={{ required: "Please select your gender" }}
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Non-binary", label: "Non-binary" },
                      { value: "Prefer not to say", label: "Prefer not to say" }
                    ]}
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Account Details */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    validation={{ 
                      required: "Email is required",
                      pattern: { 
                        value: /^\S+@\S+\.\S+$/, 
                        message: "Please enter a valid email" 
                      } 
                    }}
                    placeholder="your.email@example.com"
                  />
                  
                  <InputField 
                    label="Password" 
                    name="password" 
                    type="password" 
                    validation={{ 
                      required: "Password is required", 
                      minLength: { 
                        value: 6, 
                        message: "Password must be at least 6 characters" 
                      } 
                    }}
                    placeholder="Create a secure password"
                  />
                  
                  <InputField 
                    label="Contact Number (Optional)" 
                    name="contact" 
                    type="tel" 
                    placeholder="Your phone number"
                  />
                  
                  <InputField 
                    label="Location" 
                    name="countryCity" 
                    validation={{ required: "Location is required" }}
                    placeholder="Country / City"
                  />
                </div>
              </div>
            )}
            
            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <InputField 
                  label="Languages You Speak" 
                  name="languages" 
                  type="multiselect" 
                  validation={{ required: "Select at least one language" }}
                  options={[
                    { value: "English", label: "English" },
                    { value: "Hindi", label: "Hindi" },
                    { value: "Spanish", label: "Spanish" },
                    { value: "French", label: "French" },
                    { value: "German", label: "German" },
                    { value: "Chinese", label: "Chinese" },
                    { value: "Japanese", label: "Japanese" },
                    { value: "Arabic", label: "Arabic" }
                  ]}
                />
                
                <InputField 
                  label="Tell Us About Yourself" 
                  name="bio" 
                  type="textarea" 
                  placeholder="Share something interesting about yourself, your hobbies, or what you're looking for..."
                />
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
              
              {step < totalSteps ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 flex items-center ${step > 1 ? 'ml-auto' : ''}`}
                >
                  Next Step
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="ml-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      Complete Registration
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
          
          <div className="text-center text-gray-400 text-sm mt-8">
            Already have an account? 
            <a href="/login" className="text-purple-400 ml-1 hover:underline font-medium transition duration-300">Sign In</a>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Modals */}
      <SuccessModal />
      <ErrorModal />
    </div>
  );
};

export default Signup;