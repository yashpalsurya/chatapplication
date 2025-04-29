import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error(error);
      setError("Failed to send reset email. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-gray-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <Lock size={48} className="text-blue-500" />
          </div>
          <img 
            src="https://i.pinimg.com/736x/75/4e/21/754e21fc41e86536a2ffa06b0fa7bfc2.jpg" 
            alt="Security illustration" 
            className="rounded-lg mb-6 w-full max-w-sm mx-auto"
          />
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 mb-6">Enter your email to receive a reset link</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="name@example.com"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        {message && (
          <div className="p-4 rounded-lg bg-gray-800 border-l-4 border-green-500">
            <p className="text-green-400">{message}</p>
          </div>
        )}
        
        <div className="text-center pt-4">
          <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
            Return to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;