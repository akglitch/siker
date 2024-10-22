import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../utils/card'

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
    
      <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                  Total Attendance
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>${totalAttendance}</div>
                  <p className='text-xs text-muted-foreground'>
                    
                  </p>
                </CardContent>
              </Card>
    </React.Fragment>
  );
}
