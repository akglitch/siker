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
  Snackbar,
  Alert,
  AlertColor,
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

const AttendanceTracking: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    [key: string]: { attendance: boolean };
  }>({});
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

  const fetchSubcommittees = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Subcommittee[]>(
        "https://kmabackend.onrender.com/api/subcommittees"
      );
      setSubcommittees(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching subcommittees:", error.message);
        showSnackbar("Error fetching subcommittees", "error");
      } else {
        console.error("Unexpected error:", error);
        showSnackbar("Unexpected error occurred", "error");
      }
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
      [key]: {
        attendance: !prev[key]?.attendance,
      },
    }));
  };

  const handleSubmitAttendance = async (
    subcommitteeId: string,
    memberId: string
  ) => {
    try {
      const key = `${subcommitteeId}-${memberId}`;
      const { attendance = false } = selectedAttendance[key] || {};

      if (attendance) {
        await axios.post("https://kmabackend.onrender.com/api/mark", {
          subcommitteeId,
          memberId,
        });

        setSelectedAttendance((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        fetchSubcommittees();
        showSnackbar("Attendance submitted successfully", "success");
      } else {
        showSnackbar("Please mark attendance before submitting", "warning");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error submitting attendance:", error.message);
        showSnackbar(
          error.response?.data?.message || "Error submitting attendance",
          "error"
        );
      } else {
        console.error("Unexpected error:", error);
        showSnackbar("An unexpected error occurred", "error");
      }
    }
  };

  return (
    <div className="container mx-auto">
      <Typography variant="h5" component="div" gutterBottom>
        ATTENDANCE TRACKING
      </Typography>
      <Grid container spacing={4}>
        {loading && <p>Loading...</p>}
        {!loading && subcommittees.length === 0 && <p>No subcommittees found.</p>}
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
                        <TableCell>Portfolio</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subcommittee.members?.map((member) => {
                        const key = `${subcommittee._id}-${member.memberId}`;
                        const isAttendanceMarkedToday = subcommittee.attendance?.some(
                          (record) => {
                            if (!record.date) return false;
                            const recordDate = new Date(record.date);
                            const today = new Date();
                            // Reset the time to midnight for comparison
                            recordDate.setHours(0, 0, 0, 0);
                            today.setHours(0, 0, 0, 0);
                            return (
                              record.memberId === member.memberId &&
                              recordDate.getTime() === today.getTime()
                            );
                          }
                        ) || false; // Default to false if attendance is undefined

                        return (
                          <TableRow key={member.memberId}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.meetingsAttended || 0}</TableCell>
                            <TableCell>{member.totalAmount || 0}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={selectedAttendance[key]?.attendance || false}
                                onChange={() =>
                                  handleAttendanceChange(
                                    subcommittee._id,
                                    member.memberId
                                  )
                                }
                                disabled={isAttendanceMarkedToday}
                              />
                            </TableCell>
                            <TableCell>
                              {member.isConvener ? "Convener" : "Member"}
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

export default AttendanceTracking;
