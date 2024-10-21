"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import  { AxiosError } from 'axios';

import {
  Snackbar,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface Member {
  _id: string;
  name: string;
  contact: string;
  gender: string;
  electoralArea:string;
  memberType: string;
  isConvener?: boolean;
  isInSelectedSubcommittee?: boolean;
}
interface ErrorResponse {
  message?: string;
}
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Members: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [subcommitteeMembers, setSubcommitteeMembers] = useState<Member[]>([]);
  const [selectedSubcommittee, setSelectedSubcommittee] = useState('Travel');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const fetchSubcommitteeMembers = async () => {
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/subcommittees/members', {
        params: { subcommitteeName: selectedSubcommittee },
      });
      setSubcommitteeMembers(response.data);
    } catch (error) {
      console.error('Error fetching subcommittee members:', error);
    }
  };

  useEffect(() => {
    fetchSubcommitteeMembers();
  }, [selectedSubcommittee]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setResults([]);
      return;
    }
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/members/search', {
        params: { query: e.target.value }, // Changed from contact to query
      });
      const allMembers: Member[] = response.data;
      const membersWithStatus = allMembers.map((member) => ({
        ...member,
        isInSelectedSubcommittee: subcommitteeMembers.some((subMember) => subMember._id === member._id),
      }));
      setResults(membersWithStatus);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const handleAddMember = async (member: Member, subcommittee: string) => {
    if (!subcommittee) {
      setNotification({ show: true, message: 'Please select a subcommittee', type: 'error' });
      return;
    }
  
    // Check if the member is already in two subcommittees
    if (subcommitteeMembers.filter((m) => m._id === member._id).length >= 2) {
      setNotification({ show: true, message: 'Member can only be part of 2 subcommittees', type: 'error' });
      return;
    }
  
    // Determine if the member should be a convener
    let updatedIsConvener = false; // Default to false
  
    if (member.isConvener) {
      // If the member is a convener in another subcommittee, they should not be a convener here
      updatedIsConvener = !subcommitteeMembers.some((m) => m._id === member._id && m.isConvener);
    }
  
    setLoading(true);
    try {
      const response = await axios.post('https://kmabackend.onrender.com/api/subcommittees/addmember', {
        subcommitteeName: subcommittee,
        memberId: member._id,
        memberType: member.memberType,
        isConvener: updatedIsConvener,
      });
  
      setNotification({ show: true, message: `${member.name} added to ${subcommittee}`, type: 'success' });
  
      await fetchSubcommitteeMembers();
      handleSearch({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data as ErrorResponse;
        const errorMessage = errorResponse.message || error.message || 'Unknown error';
        console.error('Error adding member to subcommittee:', errorMessage);
        setNotification({ show: true, message: 'Error adding member to subcommittee', type: 'error' });
      } else {
        console.error('Unexpected error:', error);
        setNotification({ show: true, message: 'Unexpected error occurred', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteMember = async (member: Member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      setLoading(true);
      try {
        await axios.delete(`https://kmabackend.onrender.com/api/members/${member.memberType}/${member._id}`);
        setNotification({ show: true, message: `${member.name} deleted successfully`, type: 'success' });

        await handleSearch({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>);
      } catch (error) {
        console.error('Error deleting member:', error);
        setNotification({ show: true, message: 'Error deleting member', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditMember = async () => {
    if (!editMember) return;

    setLoading(true);
    try {
      const response = await axios.put(`https://kmabackend.onrender.com/api/members/${editMember.memberType}/${editMember._id}`, editMember);
      const updatedMember = response.data;

      setNotification({ show: true, message: `${editMember.name} updated successfully`, type: 'success' });

      setResults((prevResults) =>
        prevResults.map((member) => (member._id === updatedMember._id ? updatedMember : member))
      );
      setSubcommitteeMembers((prevSubMembers) =>
        prevSubMembers.map((subMember) => (subMember._id === updatedMember._id ? updatedMember : subMember))
      );

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating member:', error);
      setNotification({ show: true, message: 'Error updating member', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (member: Member) => {
    setEditMember(member);
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editMember) {
      setEditMember({ ...editMember, [e.target.name]: e.target.value });
    }
  };

  const handleSubcommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcommittee(e.target.value);
  };

  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="container mx-auto">
      <TextField
        label="Search members by contact"
        value={query}
        onChange={handleSearch}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Electoral_Area</TableCell>
              <TableCell>Member Type</TableCell>
              <TableCell>Subcommittee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              results.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.contact}</TableCell>
                  <TableCell>{member.gender}</TableCell>
                  <TableCell>{member.electoralArea}</TableCell>
                  <TableCell>{member.memberType}</TableCell>
                  <TableCell>
                    {!member.isInSelectedSubcommittee && (
                      <Select
                        value=""
                        onChange={(e) => handleAddMember(member, e.target.value)}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">Committees</MenuItem>
                        <MenuItem value="Travel">Travel</MenuItem>
                        <MenuItem value="Revenue">Revenue</MenuItem>
                        <MenuItem value="Transport">Transport</MenuItem>
                      </Select>
                    )}
                    {member.isConvener && (
                      <Typography variant="body2" color="textSecondary">
                        (Convener)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => openEditDialog(member)}>
                      Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDeleteMember(member)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          {editMember && (
            <div>
              <TextField
                label="Name"
                name="name"
                value={editMember.name}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Contact"
                name="contact"
                value={editMember.contact}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Gender"
                name="gender"
                value={editMember.gender}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
                <TextField
                label="Electoral_Area"
                name="electoral_Area"
                value={editMember.electoralArea}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Member Type"
                name="memberType"
                value={editMember.memberType}
                onChange={handleEditInputChange}
                fullWidth
                margin="normal"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditMember} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.show} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default Members;
