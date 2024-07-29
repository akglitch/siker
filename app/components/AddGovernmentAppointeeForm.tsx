"use client";

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { IGovernmentAppointee } from '../types';
import { Snackbar, CircularProgress } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddGovernmentAppointeeForm: React.FC = () => {
  const initialFormData: Omit<IGovernmentAppointee, '_id'> = {
    name: '',
    electoralArea: '',
    contact: '',
    gender: 'Male',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      console.log("Sending request with data:", formData); // Log form data
      const response = await axios.post('http://localhost:5000/api/appointtee', formData);
      console.log("Response:", response); // Log the response
      if (response.status === 201) {
        setNotification({ show: true, message: 'Government Appointee added successfully', type: 'success' });
        setFormData(initialFormData);
      } else {
        setNotification({ show: true, message: `Unexpected response: ${response.statusText}`, type: 'error' });
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error adding Government Appointee';
        setNotification({ show: true, message: errorMessage, type: 'error' });
      } else {
        setNotification({ show: true, message: 'An unexpected error occurred', type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };
  const handleClear = () => {
    setFormData(initialFormData);
  };

  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="p-4 bg-white shadow-md rounded mb-4">
      <h2 className="text-xl font-bold mb-4">Add Government Appointee</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Electoral Area</label>
          <input
            type="text"
            name="electoralArea"
            value={formData.electoralArea}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={saving}
          >
            {saving && (
              <CircularProgress
                size={24}
                className="inline-block mr-2"
              />
            )}
            {saving ? 'Saving...' : 'Add Government Appointee'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>
      </form>

      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddGovernmentAppointeeForm;
