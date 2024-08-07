"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { IAssemblyMember } from '../types';
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { SelectChangeEvent } from '@mui/material/Select';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddAssemblyMemberForm: React.FC = () => {
  const initialFormData: Omit<IAssemblyMember, '_id'> = {
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
    type: 'success' as 'success' | 'error',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.post('https://kmabackend.onrender.com/api/assemblymember', formData);
      if (response.status === 201 || response.status === 200) {
        setNotification({ show: true, message: 'Assembly Member added successfully', type: 'success' });
        setFormData(initialFormData);
      } else {
        setNotification({ show: true, message: `Unexpected response: ${response.statusText}`, type: 'error' });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error adding Assembly Member';
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
    <Box p={2} mb={4} boxShadow={3} borderRadius={2} bgcolor="white">
      <h2 className="text-xl font-bold mb-4">Add Assembly Member</h2>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Electoral Area"
            name="electoralArea"
            value={formData.electoralArea}
            onChange={handleChange}
            fullWidth
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            fullWidth
            required
          />
        </Box>
        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleSelectChange}
              fullWidth
              required
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? 'Saving...' : 'Add Assembly Member'}
          </Button>
          <Button variant="contained" onClick={handleClear} color="secondary">
            Clear
          </Button>
        </Box>
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
    </Box>
  );
};

export default AddAssemblyMemberForm;
