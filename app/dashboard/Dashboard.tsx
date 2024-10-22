"use client";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  CssBaseline,
  Divider,
  Drawer as MuiDrawer,
  Grid,
  IconButton,
  List,
  Paper,
  Toolbar,
  Typography,
  Badge,
  Link,
} from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import {
  Brightness4,
  Brightness7,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { ColorModeContext } from "../utils/theme";
import { MainListItems, secondaryListItems } from "./listItems";

import { SITENAME } from "../utils/data";
import TotalAssemblyMembers from "./TotalAssemblyMembers";
import TotalGovernmentAppointees from "./TotalGovernmentAppointees";
import AddGovernmentAppointeeForm from "./AddGovernmentAppointeeForm";
import AddAssemblyMemberForm from "./AddAssemblyMemberForm";
import TotalAttendance from "./TotalAttendance";
import Subcommittees from "./Allcommitees";
import AttendanceReport from "./AttendanceReport";
import AttendanceTracking from "./AttendanceTracking";
import Members from "./MemberSearch";
import GeneralMeetingAttendance from "./GeneralMeeting";
import ConvenerMeetingAttendance from "./ConvenersMeeting";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="inherit" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="#">
        {SITENAME}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function MainView() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        
        <Grid item xs={12} md={4} lg={4}>
      
            <TotalAssemblyMembers />
          
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
         
          <TotalAttendance />
        
        </Grid>
        {/* Recent Deposits */}
        <Grid item xs={12} md={4} lg={4}>
        
            <TotalGovernmentAppointees />
        
        </Grid>
        </Grid>
    
      <Copyright sx={{ pt: 4 }} />
    </Container>
  );
}

export default function Dashboard() {
  const [open, setOpen] = React.useState(true);
  const [currView, setCurrView] = React.useState(0);
  const views = [
    <MainView key={Math.random()} />,
    <AddAssemblyMemberForm key={Math.random()} />,
    <AddGovernmentAppointeeForm key={Math.random()} />,
    <Members key={Math.random()} />,
    <AttendanceTracking key={Math.random()} />,
    <AttendanceReport key={Math.random()} />,
    <Subcommittees key={Math.random()} />,
    <GeneralMeetingAttendance  key={Math.random()} />,
   <ConvenerMeetingAttendance key={Math.random()} />
  ];

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Box sx={{ display: "flex", backgroundColor: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar color="inherit" open={open}>
        <Toolbar sx={{ pr: "24px" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
          >
            <MenuIcon
              sx={{ color: theme.palette.mode === "light" ? "black" : "white" }}
            />
          </IconButton>
          <Typography
  component="h1"
  variant="h6"
  color="textPrimary"
  noWrap
  sx={{ flexGrow: 1 }}
>
  Member Management System
</Typography>
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? (
              <Brightness7 sx={{ color: "white" }} />
            ) : (
              <Brightness4 sx={{ color: "black" }} />
            )}
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon sx={{ color: theme.palette.mode === "light" ? "black" : "white" }} />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
          <IconButton onClick={toggleDrawer}>
          <Typography
  variant="body1"
  sx={{ color: theme.palette.mode === "light" ? "black" : "white", ml: 2 }}
>
John Doe {/* Ensure this state holds the correct username */}
</Typography>
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          <MainListItems setCurrView={setCurrView} />
          <Divider sx={{ my: 1 }} />
          {secondaryListItems}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Toolbar />
        <Box key={currView}>{views[currView]}</Box>
      </Box>
    </Box>
  );
}
