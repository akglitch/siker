"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Snackbar,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Select,
  MenuItem,
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
  subcommittees?: string[];
}

interface ErrorResponse {
  message?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Members: React.FC = () => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
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

  useEffect(() => {
    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/allmembers');
        setMembers(response.data);
        setFilteredMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
        setNotification({
          show: true,
          message: 'Error loading members',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter((member) =>
        member.contact.includes(query) || member.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [query, members]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };



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
        setNotification({
          show: true,
          message: `${member.name} deleted successfully`,
          type: 'success',
        });

        const updatedMembers = members.filter((m) => m._id !== member._id);
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
      } catch (error) {
        console.error('Error deleting member:', error);
        setNotification({ show: true, message: 'Error deleting member', type: 'error' });
      } finally {
        setLoading(false);
      }
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

  const handleEditMember = async () => {
    if (!editMember) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `https://kmabackend.onrender.com/api/members/${editMember.memberType}/${editMember._id}`,
        editMember
      );
      const updatedMember = response.data;
      setNotification({ show: true, message: `${editMember.name} updated successfully`, type: 'success' });

      const updatedMembers = members.map((m) =>
        m._id === updatedMember._id ? updatedMember : m
      );
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating member:', error);
      setNotification({ show: true, message: 'Error updating member', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'contact', headerName: 'Contact', width: 130 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'electoralArea', headerName: 'Electoral Area', width: 130 },
    { field: 'memberType', headerName: 'Member Type', width: 120 },
    {
      field: 'isConvener',
      headerName: 'Convener',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'subcommittee',
      headerName: 'Add to Subcommittee',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Select
          value=""
          onChange={(e) => handleAddMember(params.row, e.target.value as string)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Choose Subcommittee</MenuItem>
          <MenuItem value="Travel">Travel</MenuItem>
          <MenuItem value="Revenue">Revenue</MenuItem>
          <MenuItem value="Transport">Transport</MenuItem>
        </Select>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <Button variant="contained" color="primary" onClick={() => openEditDialog(params.row)}>
            Edit
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleDeleteMember(params.row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <TextField
        label="Search members by contact or name"
        value={query}
        onChange={handleSearch}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Paper style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredMembers}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          getRowId={(row) => row._id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          {editMember && (
            <>
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
                label="Electoral Area"
                name="electoralArea"
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
            </>
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
    </div>
  );
};

export default Members;
