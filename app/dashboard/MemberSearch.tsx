"use client";

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
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
  electoralArea: string;
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
  const [subcommittees, setSubcommittees] = useState<string[]>([]);
  const [selectedSubcommittee, setSelectedSubcommittee] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  useEffect(() => {
    // Fetch all subcommittees on component load
    const fetchSubcommittees = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/subcommittees');
        setSubcommittees(response.data.map((sc: { name: string }) => sc.name));
      } catch (error) {
        console.error('Error fetching subcommittees:', error);
      }
    };
    fetchSubcommittees();
  }, []);

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
    if (selectedSubcommittee) fetchSubcommitteeMembers();
  }, [selectedSubcommittee]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setResults([]);
      return;
    }

    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/members/search', {
        params: { query: e.target.value },
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

    if (subcommitteeMembers.filter((m) => m._id === member._id).length >= 2) {
      setNotification({ show: true, message: 'Member can only be part of 2 subcommittees', type: 'error' });
      return;
    }

    let updatedIsConvener = false;

    if (member.isConvener) {
      updatedIsConvener = !subcommitteeMembers.some((m) => m._id === member._id && m.isConvener);
    }

    setLoading(true);
    try {
      await axios.post('https://kmabackend.onrender.com/api/subcommittees/addmember', {
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
        const errorResponse = (error as AxiosError<ErrorResponse>).response?.data;
        const errorMessage = errorResponse?.message || error.message || 'Unknown error';
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
        if (axios.isAxiosError(error)) {
          const errorResponse = (error as AxiosError<ErrorResponse>).response?.data;
          const errorMessage = errorResponse?.message || error.message || 'Unknown error';
          console.error('Error deleting member:', errorMessage);
          setNotification({ show: true, message: 'Error deleting member', type: 'error' });
        } else {
          console.error('Unexpected error:', error);
          setNotification({ show: true, message: 'Unexpected error occurred', type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditDialog = (member: Member) => {
    setEditMember(member);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditMember(null);
  };

  const handleEditChange = (field: keyof Member, value: string) => {
    setEditMember((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveEdit = async () => {
    if (!editMember) return;

    try {
      await axios.put(`https://kmabackend.onrender.com/api/members/${editMember._id}`, editMember);
      setNotification({ show: true, message: `${editMember.name} updated successfully`, type: 'success' });
      closeEditDialog();
      await fetchSubcommitteeMembers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = (error as AxiosError<ErrorResponse>).response?.data;
        const errorMessage = errorResponse?.message || error.message || 'Unknown error';
        console.error('Error updating member:', errorMessage);
        setNotification({ show: true, message: 'Error updating member', type: 'error' });
      } else {
        console.error('Unexpected error:', error);
        setNotification({ show: true, message: 'Unexpected error occurred', type: 'error' });
      }
    }
  };

  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="container mx-auto">
      <TextField
        label="Search members by name or contact"
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
              <TableCell>Electoral Area</TableCell>
              <TableCell>Member Type</TableCell>
              <TableCell>Subcommittee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.slice(0, 7).map((member) => (
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
                      {subcommittees.map((sc) => (
                        <MenuItem key={sc} value={sc}>{sc}</MenuItem>
                      ))}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Dialog open={editDialogOpen} onClose={closeEditDialog}>
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editMember?.name || ''}
            onChange={(e) => handleEditChange('name', e.target.value)}
          />
          <TextField
            label="Contact"
            fullWidth
            margin="normal"
            value={editMember?.contact || ''}
            onChange={(e) => handleEditChange('contact', e.target.value)}
          />
          <TextField
            label="Gender"
            fullWidth
            margin="normal"
            value={editMember?.gender || ''}
            onChange={(e) => handleEditChange('gender', e.target.value)}
          />
          <TextField
            label="Electoral Area"
            fullWidth
            margin="normal"
            value={editMember?.electoralArea || ''}
            onChange={(e) => handleEditChange('electoralArea', e.target.value)}
          />
          <TextField
            label="Member Type"
            fullWidth
            margin="normal"
            value={editMember?.memberType || ''}
            onChange={(e) => handleEditChange('memberType', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="primary">Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Members;
