"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Snackbar, CircularProgress } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface Member {
  _id: string;
  name: string;
  contact: string;
  gender: string;
  memberType: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MemberSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [selectedSubcommittee, setSelectedSubcommittee] = useState('Travel');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setResults([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/members/search', { params: { contact: e.target.value } });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const handleAddMember = async (member: Member) => {
    try {
      await axios.post('http://localhost:5000/api/subcommittees/addmember', {
        subcommitteeName: selectedSubcommittee,
        memberId: member._id,
        memberType: member.memberType,
      });
      setNotification({ show: true, message: `${member.name} added to ${selectedSubcommittee}`, type: 'success' });
    } catch (error) {
      console.error('Error adding member to subcommittee:', error);
      setNotification({ show: true, message: 'Error adding member to subcommittee', type: 'error' });
    }
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
                <select
                  onChange={(e) => setSelectedSubcommittee(e.target.value)}
                  value={selectedSubcommittee}
                  className="border border-gray-300 rounded-md p-1"
                >
                  <option value="Travel">Travel</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Transport">Transport</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleAddMember(member)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
