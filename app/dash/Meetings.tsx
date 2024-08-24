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

// Define the necessary interfaces for types
interface Member {
  memberId: string;
  memberType: string;
  name: string;
  meetingsAttended: number;
  totalAmount: number;
  isConvener: boolean;
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
const convenerBonus = 50;

const SubcommitteeMeetings: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    [key: string]: { attendance: boolean; convener: boolean };
  }>({});
  const [attendanceReport, setAttendanceReport] = useState<ReportRecord[]>([]);

  // Fetch Subcommittees data
  const fetchSubcommittees = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Subcommittee[]>(
        "http://localhost:5000/api/subcommittees"
      );
      setSubcommittees(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching subcommittees:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcommittees();
  }, []);

  // Handle changes in attendance and convener selection
  const handleAttendanceChange = (
    subcommitteeId: string,
    memberId: string,
    field: "attendance" | "convener"
  ) => {
    const key = `${subcommitteeId}-${memberId}`;
    setSelectedAttendance((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: !prev[key]?.[field],
      },
    }));
  };

  // Submit attendance data to the backend
  const handleSubmitAttendance = async (
    subcommitteeId: string,
    memberId: string
  ) => {
    try {
      const key = `${subcommitteeId}-${memberId}`;
      const { attendance = false, convener = false } =
        selectedAttendance[key] || {};

      if (attendance || !convener) {
        await axios.post("http://localhost:5000/api/attendance", {
          subcommitteeId,
          memberId,
          convener,
        });

        setSelectedAttendance((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        fetchSubcommittees(); // Refresh the subcommittees data
      } else {
        alert("Cannot submit only with convener selected");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error submitting attendance:", error.message);
        alert(error.response?.data?.message || "Error submitting attendance");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  // Fetch the attendance report from the backend
  const handleFetchReport = async () => {
    try {
      const response = await axios.get<Subcommittee[]>(
        "http://localhost:5000/api/report"
      );
      console.log("Report data from API:", response.data); // Debugging log

      const flattenedData: ReportRecord[] = response.data.flatMap(
        (subcommittee) =>
          subcommittee.members.map((member) => ({
            subcommitteeName: subcommittee.name,
            name: member.name,
            meetingsAttended: member.meetingsAttended,
            totalAmount: member.totalAmount,
          }))
      );

      setAttendanceReport(flattenedData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching attendance report:", error.message);
        alert(error.response?.data?.message || "Error fetching attendance report");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  // Print the attendance report
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
                        <TableCell>Total Amount (GH₵)</TableCell>
                        <TableCell>Attendance</TableCell>
                        <TableCell>Mark as Convener</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subcommittee.members.map((member) => {
                        const key = `${subcommittee._id}-${member.memberId}`;
                        const isAttendanceMarkedToday = subcommittee.attendance.some(
                          (record) => {
                            const recordDate = new Date(record.date);
                            const today = new Date();
                            return (
                              record.memberId === member.memberId &&
                              recordDate.toDateString() ===
                                today.toDateString()
                            );
                          }
                        );

                        return (
                          <TableRow key={member.memberId}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.meetingsAttended || 0}</TableCell>
                            <TableCell>{member.totalAmount || 0}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={!!selectedAttendance[key]?.attendance}
                                onChange={() =>
                                  handleAttendanceChange(
                                    subcommittee._id,
                                    member.memberId,
                                    "attendance"
                                  )
                                }
                                color="primary"
                                disabled={isAttendanceMarkedToday}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={!!selectedAttendance[key]?.convener}
                                onChange={() =>
                                  handleAttendanceChange(
                                    subcommittee._id,
                                    member.memberId,
                                    "convener"
                                  )
                                }
                                color="secondary"
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
                                disabled={isAttendanceMarkedToday}
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

      <Typography variant="h5" component="div" gutterBottom>
        Attendance Report
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleFetchReport}
        style={{ marginBottom: "20px" }}
      >
        Fetch Attendance Report
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handlePrintReport}
        style={{ marginBottom: "20px", marginLeft: "20px" }}
      >
        Print Report
      </Button>
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
            {attendanceReport.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              attendanceReport.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.subcommitteeName}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.meetingsAttended}</TableCell>
                  <TableCell>{record.totalAmount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SubcommitteeMeetings;
