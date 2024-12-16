import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Title, Paragraph, Link } = Typography;

// Each step/component in the project architecture
const architectureFlow = [
  {
    name: 'Data Source',
    description: `
      Our journey begins with comprehensive datasets sourced from the US Department
      of Transportation’s Bureau of Transportation Statistics (Form 41 financial, 
      traffic, and operational data). Historical stock data is obtained from Yahoo Finance 
      to train our deep learning LSTM model for airline stock price predictions. 
      These datasets are downloaded in CSV format, offering fine-grained control over data integrity.
    `,
  },
  {
    name: 'Data Analysis',
    description: `
      Once downloaded, the raw CSV files undergo exploratory data analysis with Python, Excel, 
      and PostgreSQL. This stage uncovers key insights, identifies trends, and flags 
      anomalies in the data, ensuring an optimal foundation for the next steps.
    `,
  },
  {
    name: 'Data Processing',
    description: `
      Python scripts handle robust data cleansing and transformation—resolving missing values, 
      normalizing numeric fields, and restructuring tables. This step refines the dataset 
      for ingestion into the database and the machine learning pipeline.
    `,
  },
  {
    name: 'MongoDB',
    description: `
      The cleaned dataset is stored in MongoDB, a flexible NoSQL database suited for 
      both airline performance and stock data. Its schema-less nature simplifies queries 
      for the LSTM model and dashboard, while offering scalability for large datasets.
    `,
  },
  {
    name: 'LSTM Model & Flask API',
    description: `
      Python’s TensorFlow and scikit-learn libraries power our LSTM model, which draws 
      training data directly from MongoDB. A Flask API hosts the final model, providing 
      on-demand predictions of airline stock prices to the backend (or other consuming services).
    `,
  },
  {
    name: 'Node.js & Express (Railway)',
    description: `
      A Node.js (Express) backend deployed on Railway manages user requests and orchestrates 
      API calls between the frontend, the MongoDB database, and the Flask LSTM microservice. 
      Railway’s cloud infrastructure simplifies deployment and ensures high availability.
    `,
  },
  {
    name: 'React & Vite',
    description: `
      The user interface is built with React and scaffolded via Vite for rapid development. 
      Ant Design Pro provides a sleek dashboard layout, while Ant Design Plots generates 
      rich data visualizations. Deployed on Vercel, it delivers a responsive, interactive 
      experience for end-users monitoring airline performance and stock forecasts.
    `,
  },
];

// Tools and technologies used, each with a link
const toolsUsed = [
  {
    name: 'Python',
    description: 'Used extensively for data analysis, cleaning, transformation, and LSTM model training.',
    link: 'https://www.python.org/',
  },
  {
    name: 'PostgreSQL',
    description: 'A robust relational database leveraged during data exploration and analysis phases.',
    link: 'https://www.postgresql.org/',
  },
  {
    name: 'React',
    description: 'Primary framework for building the interactive and dynamic frontend of this website.',
    link: 'https://reactjs.org/',
  },
  {
    name: 'Ant Design',
    description: 'Professional UI framework used to create responsive dashboards and forms with a modern aesthetic.',
    link: 'https://ant.design/',
  },
  {
    name: 'Ant Design Plots',
    description: 'An easy-to-use library for creating clean, visually appealing charts and data visualizations.',
    link: 'https://charts.ant.design/',
  },
  {
    name: 'Node.js',
    description: 'Enables a lightweight, scalable server environment for handling async requests from the frontend.',
    link: 'https://nodejs.org/',
  },
  {
    name: 'Express',
    description: 'Minimalist web framework for Node.js, used here to build a RESTful API for retrieving airline and stock data.',
    link: 'https://expressjs.com/',
  },
  {
    name: 'Railway',
    description: 'Cloud hosting service used for deploying the Node.js backend with streamlined setup and scalability.',
    link: 'https://railway.app/',
  },
  {
    name: 'MongoDB',
    description: 'NoSQL database for efficient storage and querying of airline performance and stock price data.',
    link: 'https://www.mongodb.com/',
  },
  {
    name: 'TensorFlow',
    description: 'Deep learning framework employed for the LSTM model structure and training routines.',
    link: 'https://www.tensorflow.org/',
  },
  {
    name: 'scikit-learn',
    description: 'Offers convenient data preprocessing, model selection, and evaluation methods in Python.',
    link: 'https://scikit-learn.org/',
  },
  {
    name: 'Flask',
    description: 'Micro web framework used to wrap and serve the LSTM model for real-time prediction requests.',
    link: 'https://flask.palletsprojects.com/',
  },
  {
    name: 'Vercel',
    description: 'Hosting platform for seamless frontend deployment, ensuring a smooth user experience.',
    link: 'https://vercel.com/',
  },
];

const ResourcesPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      {/* Project Architecture Diagram with shadow */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', 
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        {/* Replace the src with your actual path or URL to the architecture image */}
        <img
          src="/architecture.png"
          alt="Project Architecture"
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      
      <Title level={2} style={{ marginBottom: '24px' }}>Project Architecture Flow</Title>
      <Paragraph style={{ marginBottom: '40px' }}>
        Below is a high-level breakdown of each component in our data pipeline, modeling process, 
        and deployment strategy. From the original data sources all the way to a fully-fledged 
        interactive dashboard, each step ensures accuracy, scalability, and a user-friendly experience.
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
        {architectureFlow.map((component, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card 
              title={component.name} 
              hoverable 
              style={{ height: '100%' }}
            >
              <Paragraph>{component.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={2} style={{ marginBottom: '24px' }}>Tools & Technologies</Title>
      <Paragraph style={{ marginBottom: '40px' }}>
        Below are the major frameworks, libraries, and hosting services that power our architecture. 
        These tools work in concert to deliver a cohesive, high-performing solution—from data ingestion 
        and cleaning to model deployment and interactive dashboards.
      </Paragraph>

      <Row gutter={[16, 16]}>
        {toolsUsed.map((tool, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              title={tool.name}
              hoverable
              style={{ height: '100%' }}
              extra={
                <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                  Visit
                </Link>
              }
            >
              <Paragraph>{tool.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ResourcesPage;
