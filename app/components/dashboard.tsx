// pages/dashboard.tsx
"use client";

import React from 'react';
import AddGovernmentAppointeeForm from '../components/AddGovernmentAppointeeForm';
import AddAssemblyMemberForm from '../components/AddAssemblyMemberForm';
import MemberSearch from '../components/MemberSearch';
import Subcommitees from './Allcommitees';
import { Container, Grid, Typography } from '@mui/material';


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
      </Grid>
      
    </Container>
  );
};

export default Dashboard;
