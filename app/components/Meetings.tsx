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
  Container,
} from "@mui/material";

interface Member {
  memberId: string;
  memberType: string;
  name: string;
  meetingsAttended: number;
}

interface Subcommittee {
  _id: string;
  name: string;
  members: Member[];
}

// Define the amount per meeting
const amountPerMeeting = 100;

const SubcommitteeMeetings: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    [key: string]: boolean;
  }>({});

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

  // Initial fetch of subcommittees data
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
        await axios.post(
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

        fetchSubcommittees(); // Refresh data after attendance is marked
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  // Calculate the total amount based on the number of meetings attended
  const calculateTotalAmount = (meetingsAttended: number) => {
    return meetingsAttended * amountPerMeeting;
  };

  return (
    <Container>
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
                      <TableCell>Amount (USD)</TableCell>
                      <TableCell>Mark Attendance</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subcommittee.members.map((member) => (
                      <TableRow key={member.memberId}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.meetingsAttended}</TableCell>
                        <TableCell>
                          {calculateTotalAmount(member.meetingsAttended)}
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
                              ]
                            }
                          >
                            Submit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    </Container>
  );
};

export default SubcommitteeMeetings;
