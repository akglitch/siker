"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Member {
  memberId: string;
  memberType: string;
  name: string;
  meetingsAttended: number;
  totalAmount: number;
}

interface AttendanceRecord {
  memberId: string;
  date: Date;
}

interface Subcommittee {
  _id: string;
  name: string;
  members: Member[];
  attendance: AttendanceRecord[];
}

interface ReportRecord {
  name: string;
  amount: number;
}

// Define the amount per meeting
const amountPerMeeting = 100;

const SubcommitteeMeetings: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    [key: string]: boolean;
  }>({});
  const [attendanceReport, setAttendanceReport] = useState<ReportRecord[]>([]);

  // Fetch the list of subcommittees and their members from the backend
  const fetchSubcommittees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://kmabackend.onrender.com/api/subcommittees");
      setSubcommittees(response.data);
    } catch (error) {
      console.error("Error fetching subcommittees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcommittees();
  }, []);

  // Handle the checkbox change for marking attendance
  const handleAttendanceChange = (
    subcommitteeId: string,
    memberId: string
  ) => {
    const key = `${subcommitteeId}-${memberId}`;
    setSelectedAttendance((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle the submission of attendance data to the backend
  const handleSubmitAttendance = async (
    subcommitteeId: string,
    memberId: string
  ) => {
    try {
      if (selectedAttendance[`${subcommitteeId}-${memberId}`]) {
        const response = await axios.post(
          "https://kmabackend.onrender.com/api/attendance",
          {
            subcommitteeId,
            memberId,
          }
        );

        // Clear the selected attendance state for the specific member
        setSelectedAttendance((prev) => {
          const updated = { ...prev };
          delete updated[`${subcommitteeId}-${memberId}`];
          return updated;
        });

        // Refresh data after attendance is marked
        fetchSubcommittees();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  // Fetch and display the attendance report
  const handleFetchReport = async () => {
    try {
      const response = await axios.get("https://kmabackend.onrender.com/api/attendance/report");
      setAttendanceReport(response.data);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
    }
  };

  // Print the report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Report</title>
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
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Attendance Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount (GH₵)</th>
                </tr>
              </thead>
              <tbody>
                ${attendanceReport.map(record => `
                  <tr>
                    <td>${record.name}</td>
                    <td>${record.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <Typography variant="h5" component="div" gutterBottom>
        ATTENDANCE TRACKING
      </Typography>
      <Grid container spacing={4}>
        {loading && <p>Loading...</p>}
        {subcommittees.map((subcommittee) => (
          <Grid item xs={12} md={6} key={subcommittee._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {subcommittee.name}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Meetings Attended</TableCell>
                        <TableCell>Amount (GH₵)</TableCell>
                        <TableCell>Mark Attendance</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subcommittee.members.map((member) => {
                        // Ensure attendance is initialized
                        const attendance = subcommittee.attendance || [];
                        
                        // Check if attendance is already marked for today
                        const today = new Date();
                        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
                        const isAttendanceMarkedToday = attendance.some(
                          record =>
                            record.memberId === member.memberId &&
                            new Date(record.date) >= startOfDay &&
                            new Date(record.date) <= endOfDay
                        );

                        return (
                          <TableRow key={member.memberId}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.meetingsAttended}</TableCell>
                            <TableCell>
                              {member.totalAmount}
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={
                                  selectedAttendance[
                                    `${subcommittee._id}-${member.memberId}`
                                  ] || false
                                }
                                onChange={() =>
                                  handleAttendanceChange(
                                    subcommittee._id,
                                    member.memberId
                                  )
                                }
                                color="primary"
                                disabled={isAttendanceMarkedToday}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleSubmitAttendance(
                                    subcommittee._id,
                                    member.memberId
                                  )
                                }
                                disabled={
                                  !selectedAttendance[
                                    `${subcommittee._id}-${member.memberId}`
                                  ] || isAttendanceMarkedToday
                                }
                              >
                                Submit
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Single button to fetch all reports */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleFetchReport}
        style={{ marginTop: '16px' }}
      >
        Generate Full Report
      </Button>

      {/* Report Section */}
      {attendanceReport.length > 0 && (
        <Grid container spacing={4} style={{ marginTop: '32px' }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Full Attendance Report
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Amount (GH₵)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceReport.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePrintReport}
                  style={{ marginTop: '16px' }}
                >
                  Print Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default SubcommitteeMeetings;
