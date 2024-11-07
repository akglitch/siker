import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface Member {
  _id: string;
  name: string;
  attended: boolean;
  submitted: boolean;
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface ErrorResponse {
  message: string;
}

const ConvenerMeetingAttendance: React.FC = () => {
  const [conveners, setConveners] = useState<Member[]>([]);
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Track delete confirmation dialog visibility

  useEffect(() => {
    const fetchConveners = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/conveners');
        const convenersWithAttendance = response.data.map((convener: Member) => ({
          ...convener,
          attended: false,
          submitted: false,
        }));
        setConveners(convenersWithAttendance);
      } catch (error) {
        setNotification({ show: true, message: 'Error fetching conveners', type: 'error' });
        console.error('Error fetching conveners:', error);
      }
    };

  }, []);

  const handleAttendanceChange = (id: string) => {
    setConveners((prevConveners) =>
      prevConveners.map((convener) =>
        convener._id === id ? { ...convener, attended: !convener.attended } : convener
      )
    );
  };

  const handleSubmitIndividual = async (id: string) => {
    const convener = conveners.find((convener) => convener._id === id);
    if (!convener) return;

    if (!convener.attended) {
      setNotification({
        show: true,
        message: 'Attendance must be marked before submitting',
        type: 'error',
      });
      return;
    }

    try {
      await axios.post('https://kmabackend.onrender.com/api/convener-meeting/attendance', {
        members: [{ memberId: convener._id, attended: convener.attended }],
      });

      setConveners((prevConveners) =>
        prevConveners.map((m) =>
          m._id === id ? { ...m, submitted: true } : m
        )
      );

      setNotification({
        show: true,
        message: `Attendance for ${convener.name} submitted successfully`,
        type: 'success',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Error submitting attendance for individual:', axiosError);

      const errorMessage = axiosError.response?.data?.message || `Error submitting attendance for ${convener.name}`;

      setNotification({
        show: true,
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const generatePrintableReport = async () => {
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/execoreport');
      const reportData = response.data;
  
      const reportWindow = window.open('', '', 'width=800,height=600');
  
      const reportContent = `
        <html>
        <head>
          <title>Convener Meeting Attendance Report</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>Convener Meeting Attendance Report</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .map(
                  (record: { name: string; attended: string }) => `
                <tr>
                  <td>${record.name}</td>
                  <td>${record.attended}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <button onclick="window.print()">Print Report</button>
        </body>
        </html>
      `;
  
      reportWindow?.document.write(reportContent);
      reportWindow?.document.close();
    } catch (error) {
      console.error('Error generating printable report:', error);
      setNotification({ show: true, message: 'Error generating printable report', type: 'error' });
    }
  };

  const handleDeleteAllRecords = async () => {
    try {
      const response = await axios.delete('https://kmabackend.onrender.com/api/convattendance/deleteAll');
      setNotification({ show: true, message: response.data.message, type: 'success' });
      setConveners((prevConveners) =>
        prevConveners.map((convener) => ({ ...convener, attended: false, submitted: false }))
      );
    } catch (error) {
      console.error('Error deleting all attendance records:', error);
      setNotification({ show: true, message: 'Error deleting all attendance records', type: 'error' });
    } finally {
      setDeleteDialogOpen(false); // Close the dialog after attempt
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleCloseNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Attendance</TableCell>
            <TableCell>Submit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {conveners.map((convener) => (
            <TableRow key={convener._id}>
              <TableCell>{convener.name}</TableCell>
              <TableCell>
                <Checkbox
                  checked={convener.attended}
                  onChange={() => handleAttendanceChange(convener._id)}
                  disabled={convener.submitted}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSubmitIndividual(convener._id)}
                  disabled={convener.submitted || !convener.attended}
                >
                  Submit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={generatePrintableReport} variant="outlined" color="primary" style={{ margin: '20px 0' }}>
        Generate Printable Report
      </Button>
      <Button onClick={handleOpenDeleteDialog} variant="contained" color="error" style={{ margin: '20px' }}>
        Delete All Attendance Records
      </Button>

      {/* Confirmation Dialog for Delete All */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all attendance records? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAllRecords} color="secondary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.show}
        onClose={handleCloseNotification}
        message={notification.message}
        autoHideDuration={4000}
      />
    </TableContainer>
  );
};

export default ConvenerMeetingAttendance;
