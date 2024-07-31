"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, CircularProgress, Button } from '@mui/material';
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

  const fetchSubcommitteeMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subcommittees/members', {
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
      const response = await axios.get('http://localhost:5000/api/members/search', { params: { contact: e.target.value } });
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
      await axios.post('http://localhost:5000/api/subcommittees/addmember', {
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
        await axios.delete(`http://localhost:5000/api/members/${member.memberType}/${member._id}`);
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
      <table className="min-w-full divide-y divide-gray-200 mt-4">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gender
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              In Subcommittee
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subcommittee
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((member) => (
            <tr key={member._id}>
              <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{member.contact}</td>
              <td className="px-6 py-4 whitespace-nowrap">{member.gender}</td>
              <td className="px-6 py-4 whitespace-nowrap">{member.memberType}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {member.isInSelectedSubcommittee ? 'Yes' : 'No'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
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
              <td className="px-6 py-4 whitespace-nowrap">
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
    </div>
  );
};

export default MemberSearch;
