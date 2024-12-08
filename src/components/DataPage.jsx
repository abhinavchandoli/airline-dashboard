// DataPage.js (Frontend)
import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, message, Collapse } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Link, Title, Paragraph } = Typography;
const { Panel } = Collapse;

// Data Sources Array
const dataSources = [
  {
    title: 'Air Carrier Financial Reports',
    description:
      'Form 41 Financial Data provides financial information about U.S. air carriers.',
    link: 'https://www.transtats.bts.gov/Financial.aspx',
    collectionName: 'airline_data',
  },
  {
    title: 'Air Carrier Statistics',
    description:
      'Form 41 Traffic provides detailed statistics on flights, passengers, and operations.',
    link: 'https://www.transtats.bts.gov/Traffic.aspx',
    collectionName: 'operating',
  },
  {
    title: 'Air Carrier Summary Data',
    description:
      'Summary data combines financial and operational statistics (Form 41 and 298C).',
    link: 'https://www.transtats.bts.gov/Summary.aspx',
    collectionName: 'operatingdataextended',
  },
  {
    title: 'Stock Data from Yahoo Finance',
    description:
      'Historical stock data including prices and volumes from Yahoo Finance.',
    link: 'https://finance.yahoo.com/',
    collectionName: 'stock_data',
  },
];

// Glossary Array (Ordered Alphabetically)
const glossaryTerms = [

  {
    term: 'Aircraft Fuel (Gallons)',
    definition:
      'The total amount of fuel consumed by aircraft, measured in gallons.\n\n  Sum of fuel usage in gallons.',
  },
  {
    term: 'Aircraft Operating Expenses',
    definition:
      'Expenses related directly to the operation of aircraft, such as maintenance, fuel, and crew salaries.\n\n  Sum of all aircraft-related expenses.',
  },
  {
    term: 'Airborne Hours',
    definition:
      'Total hours aircraft are in flight.\n\n  Sum of all flight hours.',
  },
  {
    term: 'CASM (Cost per Available Seat Mile)',
    definition:
      'CASM measures the cost of operating an airline per available seat mile. It includes all operating expenses except for fuel costs.\n\n  CASM = (Operating Expenses) / (Available Seat Miles)',
  },
  {
    term: 'Departures per Aircraft',
    definition:
      'The average number of departures made by each aircraft in the fleet.\n\n  Total Departures / Number of Aircraft',
  },
  {
    term: 'Expenses on Crew',
    definition:
      'Total expenses related to crew salaries, benefits, and training.\n\n  Sum of all crew-related expenses.',
  },
  {
    term: 'Flight Maintenance Expense',
    definition:
      'Expenses related to the maintenance of aircraft to ensure they are fit for flight.\n\n  Total cost of maintenance activities.',
  },
  {
    term: 'Flying Operating Expenses',
    definition:
      'Costs incurred during flight operations, including fuel, crew salaries, and maintenance performed in-flight.\n\n  Sum of expenses specifically tied to flying operations.',
  },
  {
    term: 'Fuel & Oil Expense',
    definition:
      'The cost of fuel and oil used in operating aircraft.\n\n  Total expenditure on fuel and oil.',
  },
  {
    term: 'Fuel Expense per ASM (Available Seat Mile)',
    definition:
      'Fuel cost per Available Seat Mile.\n\n  Fuel Expense / Available Seat Miles',
  },
  {
    term: 'Fuel Expense per Enplaned Passenger',
    definition:
      'Fuel cost per passenger boarded.\n\n  Fuel Expense / Number of Enplaned Passengers',
  },
  {
    term: 'Fuel Expense vs Fuel Gallons',
    definition:
      'The relationship between fuel costs and fuel consumption.\n\n  Fuel Expense / Fuel Gallons = Price per Gallon',
  },
  {
    term: 'Fuel & Oil',
    definition:
      'Combined expenses for fuel and oil used in aircraft operations.\n\n  Sum of Fuel Expense and Oil Expense.',
  },
  {
    term: 'Large Narrow-Body',
    definition:
      'Aircraft with a narrow fuselage and larger seating capacity, typically used for longer domestic or short international routes. Examples include the Boeing 737-900 and Airbus A321.',
  },
  {
    term: 'Operating Expenses',
    definition:
      'Operating expenses are the costs required for the day-to-day functioning of the airline, including salaries, maintenance, fuel, etc.\n\n  Total of all operating expense categories.',
  },
  {
    term: 'Operating Fleet',
    definition:
      'The total number of aircraft in an airline’s fleet used for operations.\n\n  Count of operational aircraft.',
  },
  {
    term: 'Operating Revenue',
    definition:
      'Operating Revenue is the total revenue generated from the airline’s primary business activities, including both passenger and cargo revenue.\n\n  Operating Revenue = Passenger Revenue + Cargo Revenue',
  },
  {
    term: 'Passenger Yield',
    definition:
      'Passenger Yield is the average amount of revenue received per passenger mile.\n\n  Passenger Yield = (Total Passenger Revenue) / (Revenue Passenger Miles)',
  },
  {
    term: 'Percentage of Fuel Expense to the Total Operating Expense',
    definition:
      'The proportion of a fuel expense category relative to the total operating expenses.\n\n  (Fuel Expense / Total Operating Expenses) * 100',
  },
  {
    term: 'Price per Gallon of Fuel',
    definition:
      'Average cost of fuel per gallon.\n\n  Fuel Expense / Fuel Gallons',
  },
  {
    term: 'RASM (Revenue per Available Seat Mile)',
    definition:
      'RASM measures the revenue earned per Available Seat Mile. It indicates how much revenue the airline generates for each seat mile available for passengers.\n\n**Calculation:** RASM = Revenue / Available Seat Miles',
  },
  {
    term: 'Revenue',
    definition:
      'Total income generated from the airline’s operations, including passenger revenue, cargo revenue, and other ancillary services.\n\n**Calculation:** Revenue = Passenger Revenue + Cargo Revenue + Ancillary Revenue',
  },
  {
    term: 'Small Narrow-Body',
    definition:
      'Aircraft with a narrow fuselage and smaller seating capacity, typically used for short domestic routes. Examples include the Boeing 737-700 and Airbus A320.',
  },
  {
    term: 'Transport Revenue - Passengers',
    definition:
      'Revenue generated from passenger operations, including ticket sales and ancillary fees.\n\n**Calculation:** Total Revenue from passengers.',
  },
  {
    term: 'Widebody',
    definition:
      'Aircraft with a wide fuselage, allowing for two aisles and greater passenger capacity. Typically used for long-haul international flights. Examples include the Boeing 777 and Airbus A350.',
  },
  
];

const DataPage = () => {
  const [loadingCollection, setLoadingCollection] = useState(null);

  const handleDownload = async (collectionName) => {
    setLoadingCollection(collectionName);
    try {
      // Define the backend API URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://dashboard-backend-production-4c8c.up.railway.app';

      const response = await axios.get(`${backendUrl}/api/download/${collectionName}`, {
        responseType: 'blob', // Important for handling binary data
      });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;

      // Extract the filename from the Content-Disposition header
      const disposition = response.headers['content-disposition'];
      let fileName = `${collectionName}.csv`; // Default filename

      if (disposition && disposition.includes('filename=')) {
        fileName = disposition
          .split('filename=')[1]
          .split(';')[0]
          .replace(/"/g, '');
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`${fileName} downloaded successfully.`);
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download the file. Please try again.');
    } finally {
      setLoadingCollection(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Data Sources Section */}
      <Title level={2} style={{ marginBottom: '24px' }}>Data Sources</Title>
      <Row gutter={[16, 16]}>
        {dataSources.map((source, index) => (
          <Col xs={24} sm={12} lg={12} key={index}>
            <Card
              title={source.title}
              hoverable
              extra={
                <Link href={source.link} target="_blank">
                  Learn More
                </Link>
              }
            >
              <Paragraph>{source.description}</Paragraph>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleDownload(source.collectionName)}
                loading={loadingCollection === source.collectionName}
              >
                Download Data
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Glossary Section */}
      <div style={{ marginTop: '48px' }}>
        <Title level={2}>Glossary</Title>
        <Collapse accordion>
          {glossaryTerms.map((term, index) => (
            <Panel header={term.term} key={index}>
              <Paragraph style={{ whiteSpace: 'pre-line' }}>{term.definition}</Paragraph>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default DataPage;
