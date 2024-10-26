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
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  // Fetch all members on component load
  useEffect(() => {
    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/allmembers');
        setMembers(response.data); // Set all members
        setFilteredMembers(response.data); // Show all members by default
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

  // Filter members based on search query
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

  // Handle search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle adding member to a subcommittee
  const handleAddMemberToSubcommittee = async (member: Member, subcommittee: string) => {
    try {
      setLoading(true);
      await axios.post('https://kmabackend.onrender.com/api/subcommittees/addmember', {
        subcommitteeName: subcommittee,
        memberId: member._id,
        memberType: member.memberType,
      });
      setNotification({ show: true, message: `${member.name} added to ${subcommittee}`, type: 'success' });
    } catch (error) {
      console.error('Error adding member to subcommittee:', error);
      setNotification({ show: true, message: 'Error adding member', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete member
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

  // Handle open edit dialog
  const openEditDialog = (member: Member) => {
    setEditMember(member);
    setEditDialogOpen(true);
  };

  // Handle edit member input change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editMember) {
      setEditMember({ ...editMember, [e.target.name]: e.target.value });
    }
  };

  // Handle edit member save
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

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setNotification({ ...notification, show: false });
  };

  // Define columns for DataGrid
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
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openEditDialog(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteMember(params.row)}
          >
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
          getRowId={(row: { _id: any; }) => row._id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

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
    </div>
  );
};

export default Members;