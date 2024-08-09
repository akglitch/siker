// pages/dashboard.tsx
"use client";

import React from 'react';
import AddGovernmentAppointeeForm from './AddGovernmentAppointeeForm';
import AddAssemblyMemberForm from './AddAssemblyMemberForm';
import MemberSearch from './MemberSearch';
import Subcommitees from './Allcommitees';
import { Container, Grid, Typography } from '@mui/material';
import SubcommitteeMeetings from './Meetings';


const Dashboard: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        kMS
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <AddGovernmentAppointeeForm />
        </Grid>
        <Grid item xs={12} md={6}>
          <AddAssemblyMemberForm />
        </Grid>
        <Grid item xs={12}>
          <MemberSearch />
        </Grid>
        <Grid item xs={12}>
          <Subcommitees />
        </Grid>
        <Grid item xs={12}>
          <SubcommitteeMeetings />
        </Grid>
      </Grid>
      
    </Container>
  );
};

export default Dashboard;
