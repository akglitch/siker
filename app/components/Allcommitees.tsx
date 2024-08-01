// components/Subcommittees.tsx
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Member {
  memberId: string;
  memberType: string;
  name: string;
}

interface Subcommittee {
  _id: string;
  name: string;
  members: Member[];
}

const Subcommitees: React.FC = () => {
  const [subcommittees, setSubcommittees] = useState<Subcommittee[]>([]);

  useEffect(() => {
    const fetchSubcommittees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/subcommittees');
        const sortedSubcommittees = response.data.sort((a: Subcommittee, b: Subcommittee) => {
          const order = ['Transport', 'Revenue', 'Travel'];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
        setSubcommittees(sortedSubcommittees);
      } catch (error) {
        console.error('Error fetching subcommittees:', error);
      }
    };

    fetchSubcommittees();
  }, []);

  return (
    <Grid container spacing={4}>
      {subcommittees.map((subcommittee) => (
        <Grid item xs={12} md={4} key={subcommittee._id}>
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
                      <TableCell>Member Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subcommittee.members.map((member) => (
                      <TableRow key={member.memberId}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.memberType}</TableCell>
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
  );
};

export default Subcommitees;
