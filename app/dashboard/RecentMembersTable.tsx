import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';

interface Member {
  _id: string;
  name: string;
  contact: string;
  gender: string;
  electoralArea: string;
  memberType: string;
  isConvener?: boolean;
  createdAt: string;
}

const RecentMembersTable: React.FC = () => {
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/allmembers');
        const sortedMembers = response.data
          .sort((a: Member, b: Member) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Get the most recent 5 members
        setRecentMembers(sortedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, []);

  return (
    <TableContainer component={Paper}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <Table aria-label="recent members table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Electoral Area</TableCell>
              <TableCell>Member Type</TableCell>
              <TableCell>Convener</TableCell>
              <TableCell>Date Added</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentMembers.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.contact}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>{member.electoralArea}</TableCell>
                <TableCell>{member.memberType}</TableCell>
                <TableCell>{member.isConvener ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default RecentMembersTable;
