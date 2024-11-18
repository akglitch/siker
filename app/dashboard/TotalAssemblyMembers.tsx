import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../utils/card';

export default function TotalAssemblyMembers() {
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Ref to track if data is already fetched
  const isDataFetched = useRef(false);

  const fetchTotalMembers = async () => {
    if (isDataFetched.current) return; // Skip fetching if data is already fetched
    setLoading(true);
    try {
      const response = await axios.get('https://kmabackend.onrender.com/api/assembly/members/total');
      setTotalMembers(response.data.total);
      isDataFetched.current = true; // Mark data as fetched
    } catch (error) {
      console.error('Error fetching total assembly members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalMembers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Assembly Members
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
