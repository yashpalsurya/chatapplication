import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/'); // Redirect to home or dashboard
    } catch (error) {
      console.error(error);
      alert('Invalid email or password!');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-gray-200 py-10">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-800">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">Welcome Back</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input 
                {...register('email', { 
                  required: "Email is required",
                  pattern: { 
                    value: /^\S+@\S+\.\S+$/, 
                    message: "Please enter a valid email" 
                  } 
                })} 
                type="email" 
                className="w-full bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <a href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <input 
                {...register('password', { 
                  required: "Password is required"
                })} 
                type="password" 
                className="w-full bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : "Sign In"}
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="h-px bg-gray-700 w-full"></div>
              <div className="text-gray-500 whitespace-nowrap text-sm">OR</div>
              <div className="h-px bg-gray-700 w-full"></div>
            </div>
            
            <div className="text-center">
              <button 
                type="button"
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium border border-gray-700 hover:bg-gray-700 transition duration-300 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              Don't have an account? 
              <a href="/signup" className="text-purple-400 ml-1 hover:underline">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;