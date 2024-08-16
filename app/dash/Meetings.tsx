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
  subcommitteeName: string;
  name: string;
  meetingsAttended: number;
  totalAmount: number;
}

const amountPerMeeting = 100;

const SubcommitteeMeetings: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    [key: string]: boolean;
  }>({});
  const [attendanceReport, setAttendanceReport] = useState<ReportRecord[]>([]);

  const fetchSubcommittees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://kmabackend.onrender.com/api/subcommittees"
      );
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

  const handleSubmitAttendance = async (
    subcommitteeId: string,
    memberId: string
  ) => {
    try {
      if (selectedAttendance[`${subcommitteeId}-${memberId}`]) {
        await axios.post(
          "https://kmabackend.onrender.com/api/attendance",
          {
            subcommitteeId,
            memberId,
          }
        );

        setSelectedAttendance((prev) => {
          const updated = { ...prev };
          delete updated[`${subcommitteeId}-${memberId}`];
          return updated;
        });

        fetchSubcommittees();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleFetchReport = async () => {
    try {
      const response = await axios.get(
        "https://kmabackend.onrender.com/api/report"
      );

      // Flatten the subcommittee data into a single array of members with their subcommittee names
      const flattenedData = response.data.flatMap((subcommittee: any) =>
        subcommittee.members.map((member: any) => ({
          subcommitteeName: subcommittee.subcommitteeName,
          name: member.name,
          meetingsAttended: member.meetingsAttended,
          totalAmount: member.totalAmount,
        }))
      );

      setAttendanceReport(flattenedData);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              h1 {
                text-align: center;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
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
              .total {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>Attendance Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Subcommittee</th>
                  <th>Name</th>
                  <th>Meetings Attended</th>
                  <th>Amount (GH₵)</th>
                </tr>
              </thead>
              <tbody>
                ${attendanceReport
                  .map(
                    (record) => `
                  <tr>
                    <td>${record.subcommitteeName}</td>
                    <td>${record.name}</td>
                    <td>${record.meetingsAttended}</td>
                    <td>${record.totalAmount}</td>
                  </tr>
                `
                  )
                  .join("")}
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
                        const attendance = subcommittee.attendance || [];

                        const today = new Date();
                        const startOfDay = new Date(
                          today.setHours(0, 0, 0, 0)
                        );
                        const endOfDay = new Date(
                          today.setHours(23, 59, 59, 999)
                        );
                        const isAttendanceMarkedToday = attendance.some(
                          (record) =>
                            record.memberId === member.memberId &&
                            new Date(record.date) >= startOfDay &&
                            new Date(record.date) <= endOfDay
                        );

                        return (
                          <TableRow key={member.memberId}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.meetingsAttended}</TableCell>
                            <TableCell>{member.totalAmount}</TableCell>
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

      <Button
        variant="contained"
        color="secondary"
        onClick={handleFetchReport}
        style={{ marginTop: "16px" }}
      >
        Generate Full Report
      </Button>

      {attendanceReport.length > 0 && (
        <Grid container spacing={4} style={{ marginTop: "32px" }}>
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
                        <TableCell>Subcommittee</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Meetings Attended</TableCell>
                        <TableCell>Amount (GH₵)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceReport.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.subcommitteeName}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.meetingsAttended}</TableCell>
                          <TableCell>{record.totalAmount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePrintReport}
                  style={{ marginTop: "16px" }}
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
