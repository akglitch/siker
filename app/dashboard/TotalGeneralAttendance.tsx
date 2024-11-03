import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../utils/card';

export default function TotalGeneralAttendance() {
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalAttendance = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/general/count');
        console.log('API Response:', response.data); // Debugging log
        setTotalAttendance(response.data.totalMembers); // Adjusted path to match API response
      } catch (error) {
        console.error('Error fetching total attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalAttendance();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total General Meeting Attendance</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 text-black"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalAttendance}</div>
        <p className="text-xs text-black">Attendance records counted</p>
      </CardContent>
    </Card>
  );
}
