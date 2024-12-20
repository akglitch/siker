"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CircularProgress, Alert } from '@mui/material';  // Import CircularProgress and Alert from MUI

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loader

    try {
      const response = await axios.post('https://kmabackend.onrender.com/api/login', { username, password });
      const { token } = response.data;
      // Save the token to local storage
      localStorage.setItem('token', token);
      // Redirect to the dashboard after successful login
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error logging in:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'An error occurred while logging in');
    } finally {
      setIsLoading(false); // Stop loader after the request completes
    }
  };

  return (
    <div
      className=" mx-auto flex h-screen w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1499123785106-343e69e68db1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1748&q=80')",
      }}
    >
      <div className="rounded-xl bg-gray-800 bg-opacity-50 px-16 py-10 shadow-lg backdrop-blur-md max-sm:px-8">
        <div className="text-white">
          <div className="mb-8 flex flex-col items-center">
            <img
              src="/kmalogo.png"
              width="150"
              alt="Kumasi Metropolitan"
            />
            <h1 className="mb-2 text-2xl">Kumasi Metropolitan</h1>
            <span className="text-gray-300">Enter Login Details</span>
          </div>
          
          {/* Error Alert using MUI */}
          {error && (
            <div className="mb-4">
              <Alert severity="error">{error}</Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-lg">
              <input
                className="rounded-3xl border-none bg-yellow-400 bg-opacity-50 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
                type="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="mb-4 text-lg">
              <input
                className="rounded-3xl border-none bg-yellow-400 bg-opacity-50 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            
            <div className="mt-8 flex justify-center text-lg text-black">
              <button
                type="submit"
                className={`flex items-center justify-center rounded-3xl bg-yellow-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-yellow-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {/* Loader Spinner using MUI's CircularProgress */}
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <Link href="" className="font-medium text-yellow-400 hover:text-yellow-300">
              Contact  Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
