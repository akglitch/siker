"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, CircularProgress, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface Member {
  _id: string;
  name: string;
  contact: string;
  gender: string;
  memberType: string;
  isInSelectedSubcommittee?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MemberSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [subcommitteeMembers, setSubcommitteeMembers] = useState<Member[]>([]);
  const [selectedSubcommittee, setSelectedSubcommittee] = useState('Travel');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const fetchSubcommitteeMembers = async () => {
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/subcommittees/members', {
        params: { subcommitteeName: selectedSubcommittee }
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
      const response = await axios.get('https://kmabackend.onrender.com/api/members/search', { params: { contact: e.target.value } });
      const allMembers: Member[] = response.data;
      const membersWithStatus = allMembers.map((member) => ({
        ...member,
        isInSelectedSubcommittee: subcommitteeMembers.some(subMember => subMember._id === member._id)
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

    setLoading(true);
    try {
      await axios.post('https://kmabackend.onrender.com/api/subcommittees/addmember', {
        subcommitteeName: subcommittee,
        memberId: member._id,
        memberType: member.memberType,
      });

      setNotification({ show: true, message: `${member.name} added to ${subcommittee}`, type: 'success' });

      await fetchSubcommitteeMembers();
      handleSearch({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>);
    } catch (error) {
      console.error('Error adding member to subcommittee:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message;
          switch (errorMessage) {
            case 'Member is already in another subcommittee':
              setNotification({ show: true, message: 'Member is already in another subcommittee', type: 'error' });
              break;
            case 'Member is already in this subcommittee':
              setNotification({ show: true, message: 'Member is already in this subcommittee', type: 'error' });
              break;
            default:
              setNotification({ show: true, message: 'Error adding member to subcommittee', type: 'error' });
          }
        } else {
          setNotification({ show: true, message: 'Error adding member to subcommittee', type: 'error' });
        }
      } else {
        setNotification({ show: true, message: 'An unexpected error occurred', type: 'error' });
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

      // Update the specific member in the results array
      setResults(prevResults => prevResults.map(member => member._id === updatedMember._id ? updatedMember : member));

      // Update the specific member in the subcommitteeMembers array if they belong to the selected subcommittee
      setSubcommitteeMembers(prevSubMembers => prevSubMembers.map(subMember => subMember._id === updatedMember._id ? updatedMember : subMember));

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
    <div className="p-4">
      <input
        type="text"
        placeholder="Search members by contact..."
        value={query}
        onChange={handleSearch}
        className="search-bar border border-gray-300 p-2 rounded-md"
      />
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Subcommittee
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 whitespace-nowrap text-center">
                  No results found.
                </td>
              </tr>
            )}
            {results.map((member) => (
              <tr key={member._id}>
                <td className="px-4 py-4 whitespace-nowrap">{member.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{member.contact}</td>
                <td className="px-4 py-4 whitespace-nowrap">{member.gender}</td>
                <td className="px-4 py-4 whitespace-nowrap">{member.memberType}</td>
                <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                  {!member.isInSelectedSubcommittee && (
                    <select
                      onChange={(e) => handleAddMember(member, e.target.value)}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="">Committees</option>
                      <option value="Travel">Travel</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Transport">Transport</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap space-x-2">
                  <Button
                    onClick={() => openEditDialog(member)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteMember(member)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-4">
          <CircularProgress />
        </div>
      )}

      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={editMember?.name || ''}
            onChange={handleEditInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={editMember?.contact || ''}
            onChange={handleEditInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Gender"
            name="gender"
            value={editMember?.gender || ''}
            onChange={handleEditInputChange}
            fullWidth
          />
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
    </div>
  );
};

export default MemberSearch;
