import * as React from 'react';
import Typography from '@mui/material/Typography';

interface TitleProps {
  children?: React.ReactNode;
}

export default function Title(props: TitleProps) {
  return (
    <div className="container mx-auto">
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
    </div>
  );
}