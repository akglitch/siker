import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function TotalAssemblyMembers() {
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assembly/members/total');
        setTotalMembers(response.data.total);
      } catch (error) {
        console.error('Error fetching total assembly members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalMembers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <Title>Total Assembly Members</Title>
      <Typography component="p" variant="h4">
        {totalMembers}
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
