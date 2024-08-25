import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Book, Logout, Note, Print, Scanner, ScannerSharp } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export const MainListItems  = (props: any) => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      router.push('/login');
    } catch (error: any) {
      console.error('Error logging out:', error.response?.data?.message || error.message);
    }
  };
  const {setCurrView} = props

 return (
   <React.Fragment>
     <ListItemButton onClick={() => setCurrView(0)}>
       <ListItemIcon>
         <DashboardIcon />
       </ListItemIcon>
       <ListItemText primary="Dashboard" />
     </ListItemButton>
     <ListItemButton onClick={() => setCurrView(1)}>
       <ListItemIcon>
         <Book />
       </ListItemIcon>
       <ListItemText primary="addAssembly member" />
     </ListItemButton>
     <ListItemButton onClick={() => setCurrView(2)}>
       <ListItemIcon>
         <Book />
       </ListItemIcon>
       <ListItemText primary="addGovernment Appointee" />
     </ListItemButton>
     <ListItemButton onClick={() => setCurrView(3)}>
       <ListItemIcon>
         <Note />
       </ListItemIcon>
       <ListItemText primary="Members" />
     </ListItemButton>
     <ListItemButton onClick={() => setCurrView(4)}>
       <ListItemIcon>
         <Note />
       </ListItemIcon>
       <ListItemText primary="Attendance" />
     </ListItemButton>
     <ListItemButton onClick={() => setCurrView(5)}>
      <ListItemIcon>
        <Note/>
      </ListItemIcon>
      <ListItemText primary="Report" />
    </ListItemButton>
    <ListItemButton onClick={() => setCurrView(6)}>
       <ListItemIcon>
         <Note />
       </ListItemIcon>
       <ListItemText primary="Subcommittees" />
     </ListItemButton>
     
     
    
    <ListSubheader  >
    <ListItemButton onClick={handleLogout} >
      <ListItemIcon>
        <Logout />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItemButton>
    </ListSubheader>
   </React.Fragment>
 );
}


export const secondaryListItems = (
 


  <React.Fragment>
    
   
  
     
  </React.Fragment>
);
