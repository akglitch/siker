"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  AlertColor,
  Typography,
} from "@mui/material";

// Add this section if you haven't imported the Subcommittee type
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

const AttendanceReport: React.FC = () => {
  const [attendanceReport, setAttendanceReport] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: AlertColor = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFetchReport = async () => {
    setLoading(true);
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
      showSnackbar("Report fetched successfully", "success");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching attendance report:", error.message);
        showSnackbar(
          error.response?.data?.message || "Error fetching attendance report",
          "error"
        );
      } else {
        console.error("Unexpected error:", error);
        showSnackbar("An unexpected error occurred", "error");
      }
    } finally {
      setLoading(false);
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
    <div className="container mx-auto">
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

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AttendanceReport;
