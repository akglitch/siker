import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../utils/card';

export default function TotalConveners() {
  const [totalConveners, setTotalConveners] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalConveners = async () => {
      try {
        const response = await axios.get('https://kmabackend.onrender.com/api/totalconveners');
        setTotalConveners(response.data.totalConveners); // Corrected field name
      } catch (error) {
        console.error('Error fetching total conveners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalConveners();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Conveners
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
            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalConveners}</div>
          <p className='text-xs text-muted-foreground'>
            Total count of all conveners
          </p>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
