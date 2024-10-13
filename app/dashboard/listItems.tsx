import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Add, Book, Logout, Note, People, Group, MeetingRoom, Print, MeetingRoomSharp } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material'; // Import MUI's CircularProgress

export const MainListItems = (props: any) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false); // State to handle loading

  const handleLogout = async () => {
    setIsLoggingOut(true); // Start loading when logout is initiated
    try {
      await axios.post('https://kmabackend.onrender.com/api/logout', {}, { withCredentials: true });
      router.push('/login'); // Redirect to login after logging out
    } catch (error: any) {
      console.error('Error logging out:', error.response?.data?.message || error.message);
    } finally {
      setIsLoggingOut(false); // Stop loading after request is complete
    }
  };

  const { setCurrView } = props;

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
          <Add />
        </ListItemIcon>
        <ListItemText primary="addAssembly member" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(2)}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary="add Appointee" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(3)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText primary="Members" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(4)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText primary="Attendance" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(5)}>
        <ListItemIcon>
          <Print />
        </ListItemIcon>
        <ListItemText primary="Report" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(6)}>
        <ListItemIcon>
          <Group />
        </ListItemIcon>
        <ListItemText primary="Subcommittees" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(7)}>
        <ListItemIcon>
          <MeetingRoom />
        </ListItemIcon>
        <ListItemText primary="GeneralMeeting" />
      </ListItemButton>
      <ListItemButton onClick={() => setCurrView(8)}>
        <ListItemIcon>
          <MeetingRoom />
        </ListItemIcon>
        <ListItemText primary="Execo" />
      </ListItemButton>

      <ListSubheader>
        {/* Logout Button */}
        <ListItemButton onClick={handleLogout} disabled={isLoggingOut}> {/* Disable button while logging out */}
          <ListItemIcon>
            {isLoggingOut ? (
              <CircularProgress size={24} color="inherit" /> // Loader spinner for logout process
            ) : (
              <Logout />
            )}
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListSubheader>
    </React.Fragment>
  );
};

export const secondaryListItems = <React.Fragment></React.Fragment>;
