// AboutPage.js
import React from 'react';
import { List, Typography, Space, Divider } from 'antd';
import { LinkedinFilled, GithubOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Existing team member data
const teamMembers = [
  {
    name: 'Abhinav Chandoli',
    role: 'Data Analysis, Data Visualization, Frontend Web Development, Backend Development',
    linkedin: 'https://www.linkedin.com/in/abhinav-chandoli-03',
    github: 'https://github.com/abhinavchandoli',
  },
  {
    name: 'Sai Krishna Nalla',
    role: 'Data Analysis, Backend Development, Machine Learning',
    linkedin: 'www.linkedin.com/in/sai-krishna-nalla-361289190',
  },
  {
    name: 'Prudhviraj Sakile',
    role: 'Data Preprocessing, Database Management',
    linkedin: 'https://www.linkedin.com/in/prudhvi-raj-22ba27217',
  },
  {
    name: 'Pranay Reddy Ala',
    role: 'Product Owner, Client Communication',
    linkedin: 'https://www.linkedin.com/in/david-brown',
  },
  {
    name: 'Kiran Kumar Reddy Yerrabathini',
    role: 'Scrum Master, Planning and Executing Sprints',
    linkedin: 'https://www.linkedin.com/in/kiran-kumar-reddy-yerrabathini-ba9088239/',
  },
];

// Professor (Advisor) data
// Add as many professors as needed.
const professors = [
  {
    name: 'Isaac K. Gang',
    role: 'Associate Professor at George Mason University',
    linkedin: 'https://www.linkedin.com/in/isaacgang/'
  },
];

// Client information
// Add as many clients as needed.
const clients = [
  {
    name: 'GMU Center for Air Transportation Systems Research (CATSR)',
    role: 'Dr. Lance Sherry, Director, CATSR',
    linkedin: 'https://www.linkedin.com/in/lance-sherry-298aa8182/',
  },
];

const AboutPage = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Introduction Section */}
      <Typography>
        <Title level={2}>About Our Dashboard</Title>
        <Paragraph>
          Our Airline Performance Dashboard is designed to provide comprehensive insights into the financial and operational metrics of various airlines. By consolidating data from reliable sources such as the Bureau of Transportation Statistics and Yahoo Finance, the dashboard aims to assist stakeholders in making informed decisions, identifying trends, and evaluating the performance of different carriers in the aviation industry.
        </Paragraph>
        <Paragraph>
          This project serves as the capstone for our Master's program, demonstrating the application of advanced data analysis, machine learning, and full-stack development. It integrates academic rigor, industry best practices, and professional guidance to deliver a tool that can empower airlines, consultants, and investors.
        </Paragraph>
      </Typography>

      <Divider />

      {/* Team Members Section */}
      <Typography>
        <Title level={3}>Meet Our Team</Title>
      </Typography>
      <List
        itemLayout="vertical"
        dataSource={teamMembers}
        renderItem={(member) => (
          <List.Item
            key={member.name}
            style={{
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <List.Item.Meta
              title={<Title level={4} style={{ margin: 0 }}>{member.name}</Title>}
              description={<Text strong>{member.role}</Text>}
            />
            {member.description && (
              <Paragraph style={{ marginTop: '8px' }}>{member.description}</Paragraph>
            )}
            <Space>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <LinkedinFilled style={{ fontSize: '24px', color: '#0e76a8' }} />
                </a>
              )}
                {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name}'s GitHub`}
                >
                  <GithubOutlined style={{ fontSize: '24px', color: '#333' }} />
                </a>
              )}
            </Space>
          </List.Item>
        )}
      />

      <Divider />

      {/* Professors / Advisors Section */}
      <Typography>
        <Title level={3}>Our Faculty Advisor</Title>
      </Typography>
      <List
        itemLayout="vertical"
        dataSource={professors}
        renderItem={(prof) => (
          <List.Item
            key={prof.name}
            style={{
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <List.Item.Meta
              title={<Title level={4} style={{ margin: 0 }}>{prof.name}</Title>}
              description={<Text strong>{prof.role}</Text>}
            />
            {prof.description && (
              <Paragraph style={{ marginTop: '8px' }}>{prof.description}</Paragraph>
            )}
            <Space>
              {prof.linkedin && (
                <a
                  href={prof.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${prof.name}'s LinkedIn`}
                >
                  <LinkedinFilled style={{ fontSize: '24px', color: '#0e76a8' }} />
                </a>
              )}
            </Space>
          </List.Item>
        )}
      />

      <Divider />

      {/* Clients Section */}
      <Typography>
        <Title level={3}>Our Clients</Title>
      </Typography>
      <List
        itemLayout="vertical"
        dataSource={clients}
        renderItem={(client) => (
          <List.Item
            key={client.name}
            style={{
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <List.Item.Meta
              title={<Title level={4} style={{ margin: 0 }}>{client.name}</Title>}
              description={<Text strong>{client.role}</Text>}
            />
            {client.description && (
              <Paragraph style={{ marginTop: '8px' }}>{client.description}</Paragraph>
            )}
            <Space>
              {client.linkedin && (
                <a
                  href={client.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${client.name}'s LinkedIn`}
                >
                  <LinkedinFilled style={{ fontSize: '24px', color: '#0e76a8' }} />
                </a>
              )}
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AboutPage;
