import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Link } = Typography;

const resources = [
  {
    name: 'React',
    description: 'Used as the primary framework for building the dynamic and interactive frontend of this website.',
    link: 'https://reactjs.org/',
  },
  {
    name: 'Ant Design',
    description: 'Leveraged for building responsive UI components like cards, tables, and forms with a professional look.',
    link: 'https://ant.design/',
  },
  {
    name: 'MongoDB',
    description: 'Served as the database for storing and querying airline performance and stock data efficiently.',
    link: 'https://www.mongodb.com/',
  },
  {
    name: 'Node.js',
    description: 'Used to set up the server and handle asynchronous requests from the frontend to the backend. EXPRESS is used to create a backend API for serving airline and stock data from MongoDB to the dashboard.',
    link: 'https://nodejs.org/',
  },
  {
    name: 'Ant Design Charts',
    description: 'Implemented to render visually appealing charts such as line, column, and area charts for data visualization.',
    link: 'https://charts.ant.design/',
  },
  {
    name: 'Mongoose',
    description: 'Utilized for schema definition and querying data from MongoDB with a simpler and structured syntax.',
    link: 'https://mongoosejs.com/',
  },
];

const ResourcesPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Resources</h2>
      <Row gutter={[16, 16]}>
        {resources.map((resource, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              title={resource.name}
              hoverable
              extra={<Link href={resource.link} target="_blank">Learn More</Link>}
            >
              <p>{resource.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ResourcesPage;
