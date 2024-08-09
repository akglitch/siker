
import { Typography } from '@mui/material';
import Dashboard from './components/dashboard';
import SubcommitteeMeetings from './components/Meetings';
import Link from 'next/link';

export default function Home() {
  return (
    
    <main className="min-h-screen bg-white text-black">
   
  <Dashboard />
  <SubcommitteeMeetings />
  <Typography variant="body2" color="inherit" align="center" >
      {"Copyright © "}
      <Link color="inherit" href="#">
        Kaytee
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
    </main>

  );
}
