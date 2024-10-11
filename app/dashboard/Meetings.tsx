import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

// Alert component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Define Meeting Type
interface Meeting {
  _id: string;
  title: string;
  date: string;
  minutes: string;
  createdBy: string;
}

// Main Component for managing meetings
export default function MeetingManager() {
  const initialFormData: Omit<Meeting, '_id'> = {
    title: '',
    date: '',
    minutes: '',
    createdBy: '60c72b4d5f1b2c7d5c8e88f9', // Example ID, replace with actual ID if needed
  };

  const [formData, setFormData] = useState(initialFormData);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  // Fetch meetings when the component loads
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch meetings from the API
  const fetchMeetings = async () => {
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/meetings');
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  // Handle form input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  // Handle form submission for creating or editing meetings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing && editingMeetingId) {
        // Update existing meeting
        await axios.put(`https://kmabackend.onrender.com/api/meetings/${editingMeetingId}`, formData);
        setNotification({ show: true, message: 'Meeting updated successfully', type: 'success' });
      } else {
        // Create new meeting
        await axios.post('https://kmabackend.onrender.com/api/meetings/create', formData);
        setNotification({ show: true, message: 'Meeting created successfully', type: 'success' });
      }
      fetchMeetings(); // Refresh meeting list
      resetForm();
    } catch (error) {
      setNotification({ show: true, message: 'Error saving meeting', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Reset the form after submission
  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingMeetingId(null);
  };

  // Handle edit button click
  const handleEdit = (meeting: Meeting) => {
    setFormData({ title: meeting.title, date: meeting.date.substring(0, 10), minutes: meeting.minutes, createdBy: meeting.createdBy });
    setIsEditing(true);
    setEditingMeetingId(meeting._id);
  };

  // Handle delete button click
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://kmabackend.onrender.com/api/meetings/${id}`);
      setNotification({ show: true, message: 'Meeting deleted successfully', type: 'success' });
      fetchMeetings();
    } catch (error) {
      setNotification({ show: true, message: 'Error deleting meeting', type: 'error' });
    }
  };

  // Handle notification close
  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="container mx-auto">
      <Box p={2} mb={4} boxShadow={3} borderRadius={2} bgcolor="background.paper">
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Edit Meeting' : 'Add New Meeting'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Meeting Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Meeting Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Meeting Minutes"
              name="minutes"
              value={formData.minutes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
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
              {saving ? 'Saving...' : isEditing ? 'Update Meeting' : 'Add Meeting'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={resetForm}>
              Clear
            </Button>
          </Box>
        </form>
      </Box>

      {/* Meeting List */}
      <Box p={2} mb={4} boxShadow={3} borderRadius={2} bgcolor="background.paper">
        <Typography variant="h6" gutterBottom>
          Meeting List
        </Typography>
        {meetings.map((meeting) => (
          <Box key={meeting._id} mb={2} p={2} borderRadius={2} boxShadow={1}>
            <Typography variant="h6">{meeting.title}</Typography>
            <Typography variant="body1">Date: {new Date(meeting.date).toLocaleDateString()}</Typography>
            <Typography variant="body2">Minutes: {meeting.minutes}</Typography>
            <Box mt={2} display="flex" gap={2}>
              <Button variant="contained" color="primary" onClick={() => handleEdit(meeting)}>
                Edit
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => handleDelete(meeting._id)}>
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Snackbar for notifications */}
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
}
