// AboutPage.js
import React from 'react';
import { List, Typography, Space, Divider } from 'antd';
import { LinkedinFilled } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Sample team member data with LinkedIn URLs
const teamMembers = [
  {
    name: 'Abhinav Chandoli',
    role: 'Data Analysis, Data Visualization, Frontend Web Development',
    linkedin: 'https://www.linkedin.com/in/abhinav-chandoli-03', // Replace with actual LinkedIn URLs
  },
  {
    name: 'Sai Krishna Nalla',
    role: 'Data Analysis, Backend Development, Machine Learning',
    linkedin: 'https://www.linkedin.com/in/bob-smith',
  },
  {
    name: 'Prudhviraj sakile ',
    role: 'Data Preprocessing, Database Management',
    linkedin: 'https://www.linkedin.com/in/carol-white',
  },
  {
    name: 'Pranay Reddy Ala ',
    role: 'Product Owner, Client Communication',
    linkedin: 'https://www.linkedin.com/in/david-brown',
  },
  {
    name: 'Kiran Kumar Reddy Yerrabathini',
    role: 'Scrum Master, Planning and executing sprints',
    linkedin: 'https://www.linkedin.com/in/eva-green',
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
            <Paragraph style={{ marginTop: '8px' }}>{member.description}</Paragraph>
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
              {/* Add more social icons here if needed */}
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AboutPage;
