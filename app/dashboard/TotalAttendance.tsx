import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function TotalAttendance() {
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalAttendance = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/total');
        setTotalAttendance(response.data.total);
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
    <React.Fragment>
      <Title>Total Attendance</Title>
      <Typography component="p" variant="h4">
        {totalAttendance}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        {new Date().toLocaleDateString()}
      </Typography>
      <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          View details
        </Link>
      </div>
    </React.Fragment>
  );
}
