import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, axisClasses } from '@mui/x-charts';
import { ChartsTextStyle } from '@mui/x-charts/ChartsText';
import Title from './Title';
import axios from 'axios';

// Define the shape of the chart data
interface ChartData {
  time: string;
  incomingAmount: number;
  outgoingAmount: number;
}

// Generate Data for LineChart
function generateChartData(incomingRecords: number[], outgoingRecords: number[]): ChartData[] {
  const timeLabels = [
    '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'
  ];
  
  return timeLabels.map((time, index) => ({
    time,
    incomingAmount: incomingRecords[index] || 0,
    outgoingAmount: outgoingRecords[index] || 0,
  }));
}

export default function Chart() {
  const theme = useTheme();
  const [incomingRecords, setIncomingRecords] = React.useState<number[]>([]);
  const [outgoingRecords, setOutgoingRecords] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchIncomingRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/incoming/records');
        const allRecords = response.data;
        const totalRecords = allRecords.length;
        const recordsPerHour = totalRecords / 9; // Assuming data is evenly distributed per hour
        const incomingRecordsData = Array(9).fill(recordsPerHour);
        setIncomingRecords(incomingRecordsData);
      } catch (error) {
        console.error('Error fetching total incoming records:', error);
      }
    };

    const fetchOutgoingRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/outgoing/records');
        const allRecords = response.data;
        const totalRecords = allRecords.length;
        const recordsPerHour = totalRecords / 9; // Assuming data is evenly distributed per hour
        const outgoingRecordsData = Array(9).fill(recordsPerHour);
        setOutgoingRecords(outgoingRecordsData);
      } catch (error) {
        console.error('Error fetching total outgoing records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingRecords();
    fetchOutgoingRecords();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const chartData = generateChartData(incomingRecords, outgoingRecords);

  return (
    <React.Fragment>
      <Title>Total Records Overview</Title>
      <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        <LineChart
          dataset={chartData as any} // Temporarily cast to any if necessary
          margin={{
            top: 16,
            right: 20,
            left: 70,
            bottom: 30,
          }}
          xAxis={[
            {
              scaleType: 'point',
              dataKey: 'time',
              tickNumber: 2,
              tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
            },
          ]}
          yAxis={[
            {
              label: 'Records',
              labelStyle: {
                ...(theme.typography.body1 as ChartsTextStyle),
                fill: theme.palette.text.primary,
              },
              tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
              max: Math.max(...incomingRecords, ...outgoingRecords) + 100, // Adjust max dynamically
              tickNumber: 3,
            },
          ]}
          series={[
            {
              dataKey: 'incomingAmount',
              showMark: false,
              color: theme.palette.primary.light,
            },
            {
              dataKey: 'outgoingAmount',
              showMark: false,
              color: theme.palette.secondary.light,
            }
          ]}
          sx={{
            [`.${axisClasses.root} line`]: { stroke: theme.palette.text.secondary },
            [`.${axisClasses.root} text`]: { fill: theme.palette.text.secondary },
            [`& .${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translateX(-25px)',
            },
          }}
        />
      </div>
    </React.Fragment>
  );
}
