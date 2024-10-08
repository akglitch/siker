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
} from '@mui/material';

interface Member {
  _id: string;
  name: string;
  attended: boolean;
  submitted: boolean; // Track submission status
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface ErrorResponse {
  message: string;
}

const GeneralMeetingAttendance: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/generalmembers');
        const membersWithAttendance = response.data.map((member: Member) => ({
          ...member,
          attended: false,
          submitted: false, // Initially not submitted
        }));
        setMembers(membersWithAttendance);
      } catch (error) {
        setNotification({ show: true, message: 'Error fetching members', type: 'error' });
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, []);

  const handleAttendanceChange = (id: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member._id === id ? { ...member, attended: !member.attended } : member
      )
    );
  };

  const handleSubmitIndividual = async (id: string) => {
    const member = members.find((member) => member._id === id);
    if (!member || !member.attended) {
      setNotification({
        show: true,
        message: 'Attendance must be marked before submitting',
        type: 'error',
      });
      return;
    }

    try {
      await axios.post('https://kmabackend.onrender.com/api/general-meeting/attendance', {
        members: [{ memberId: member._id, attended: member.attended }],
      });

      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m._id === id ? { ...m, submitted: true } : m
        )
      );

      setNotification({
        show: true,
        message: `Attendance for ${member.name} submitted successfully`,
        type: 'success',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Error submitting attendance for individual:', axiosError);

      const errorMessage = axiosError.response?.data?.message || `Error submitting attendance for ${member.name}`;

      setNotification({
        show: true,
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const generatePrintableReport = async () => {
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/generalreport');
      const reportData = response.data;

      const reportWindow = window.open('', '', 'width=800,height=600');

      const reportContent = `
        <html>
        <head>
          <title>General Meeting Attendance Report</title>
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
          <h1>General Meeting Attendance Report</h1>
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
                  (item: Member) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.attended ? 'Present' : 'Absent'}</td>
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
      setNotification({ show: true, message: 'Error generating report', type: 'error' });
      console.error('Error generating report:', error);
    }
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
          {members.map((member) => (
            <TableRow key={member._id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>
                <Checkbox
                  checked={member.attended}
                  onChange={() => handleAttendanceChange(member._id)}
                  disabled={member.submitted} // Disable if already submitted
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSubmitIndividual(member._id)}
                  disabled={member.submitted || !member.attended} // Disable if already submitted or not attended
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

      <Snackbar
        open={notification.show}
        onClose={handleCloseNotification}
        message={notification.message}
        autoHideDuration={4000}
      />
    </TableContainer>
  );
};

export default GeneralMeetingAttendance;
