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
  Typography,
  FormControlLabel,
  Checkbox,
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
    isConvener: false,  // Initialize the isConvener field
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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, isConvener: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.post('http://localhost:5000/api/assemblymember', formData);
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
    <div className="container mx-auto">
      <Box p={2} mb={4} boxShadow={3} borderRadius={2} bgcolor="background.paper">
        <Typography variant="h6" gutterBottom>
          Add Assembly Member
        </Typography>
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
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleSelectChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isConvener"
                  checked={formData.isConvener}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="Is Convener"
            />
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
            <Button variant="outlined" onClick={handleClear} color="secondary">
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
    </div>
  );
};

export default AddAssemblyMemberForm;
