import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const airlines = [
  { id: 'alaska-airlines', name: 'Alaska Airlines Inc.', logo: '/alaska-logo.png' },
  { id: 'allegiant-air', name: 'Allegiant Air', logo: '/allegiant-logo.png' },
  { id: 'american-airlines', name: 'American Airlines Inc.', logo: '/american-logo.png' },
  { id: 'delta-airlines', name: 'Delta Air Lines Inc.', logo: '/delta-logo.png' },
  { id: 'frontier-airlines', name: 'Frontier Airlines Inc.', logo: '/frontier-logo.png' },
  { id: 'jetblue-airlines', name: 'JetBlue Airways', logo: '/jetblue-logo.png' },
  { id: 'hawaiian-airlines', name: 'Hawaiian Airlines Inc.', logo: '/hawaiian-logo.png' },
  { id: 'southwest-airlines', name: 'Southwest Airlines Co.', logo: '/southwest-logo.png' },
  { id: 'spirit-airlines', name: 'Spirit Air Lines', logo: '/spirit-logo.png' },
  { id: 'united-airlines', name: 'United Air Lines Inc.', logo: '/united-logo.png' },
];

const AirlineLogo = ({ airline }) => {
  return (
    <div style={{ height: '80px', overflow: 'hidden' }}>
      <Link to={`/airline/${airline.id}`}>
        <img
          src={airline.logo}
          alt={airline.name}
          className="img-fluid"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>
    </div>
  );
};

const HomePage = () => {
  // Set the initial active airline to the first in the array
  const [activeAirlineId, setActiveAirlineId] = useState(airlines[0].id);

  return (
    <Container fluid className="text-center" style={{ paddingTop: '5rem' }}>
      <div
        className="main-title-section"
        style={{
          backgroundImage: 'url(/daniel-shapiro-tpdQ8_h5Mzg-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '5rem 2rem',
          textAlign: 'left',
          borderRadius: '15px',
        }}
      >
        <h1
          className="display-3 fw-bold"
          style={{ color: '#000000', fontFamily: 'Figtree, sans-serif' }}
        >
          Airline Financial Economics
        </h1>
        <p
          className="lead"
          style={{ color: '#000000', fontFamily: 'Figtree, sans-serif' }}
        >
          Discover insights across major airlines and unlock data-driven strategies.
        </p>
      </div>

      <hr
        style={{
          width: '50%',
          margin: '2rem auto',
          borderTop: '3px solid #005239',
        }}
      />

      <h2
        className="fw-bold"
        style={{ color: '#005239', fontFamily: 'Figtree, sans-serif' }}
      >
        Analysis by Airline
      </h2>
      <p>Hover over an airline logo to highlight it.</p>

      <Row className="justify-content-center" style={{ marginTop: '3rem' }}>
        {airlines.map((airline) => (
          <Col
            xs={6}
            sm={4}
            md={3}
            lg={2}
            key={airline.id}
            className={`mb-4 logo-col ${activeAirlineId === airline.id ? 'border-highlight' : ''}`}
            style={{ display: 'flex', justifyContent: 'center' }}
            onMouseEnter={() => setActiveAirlineId(airline.id)}
          >
            <AirlineLogo airline={airline} />
          </Col>
        ))}
      </Row>

      {/* Welcome Section */}
      <div style={{ marginTop: '2rem', textAlign: 'left' }}>
        <Title level={2} style={{ color: '#005239', fontFamily: 'Figtree, sans-serif' }}>
          Welcome to Airline Financial Economics Dashboard
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          The U.S. airline industry is a vital component of the nation's economy, connecting people
          and goods across vast distances. With a rich history of innovation and competition, it
          plays a crucial role in global commerce and tourism. Understanding the financial dynamics
          of airlines is essential for stakeholders, investors, and policymakers to make informed
          decisions in this rapidly evolving sector.
        </Paragraph>
        <Paragraph style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          This project addresses the need for accessible and comprehensive financial analysis of
          major U.S. airlines. Developed as a capstone project for the{' '}
          <a href="https://catsr.vse.gmu.edu/" target="_blank" rel="noopener noreferrer">
            Center for Air Transportation Systems Research (CATSR)
          </a>{' '}
          at George Mason University, which was chartered in 2003, the dashboard provides valuable
          insights into airline performance metrics. It empowers users to explore data trends and
          derive meaningful conclusions about the industry's financial health.
        </Paragraph>
        <Paragraph style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          We utilized authoritative data sources, including the U.S. Department of Transportation's{' '}
          <a href="https://www.transtats.bts.gov/" target="_blank" rel="noopener noreferrer">
            Bureau of Transportation Statistics
          </a>{' '}
          and historical stock data from Yahoo Finance. This
          ensures that the information presented is accurate, up-to-date, and reflective of the
          current market conditions. The integration of multiple data sets allows for a holistic
          view of each airline's operational and financial status.
        </Paragraph>
        <Paragraph style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          The Airline Financial Economics Dashboard is designed for aviation professionals,
          financial analysts, researchers, and anyone interested in the economic aspects of air
          transportation. It offers interactive tools and visualizations to analyze key performance
          indicators, compare airlines, and understand market trends. By providing this resource, we
          aim to support informed decision-making and contribute to the advancement of the aviation
          industry.
        </Paragraph>
      </div>
    </Container>
  );
};

export default HomePage;
