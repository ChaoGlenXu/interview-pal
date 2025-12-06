import { Interview } from '@/types/interview';

export const mockInterviews: Interview[] = [
  {
    id: '1',
    title: 'Frontend Developer Interview',
    company: 'Google',
    jobType: 'Software Engineering',
    experienceLevel: 'Senior',
    date: new Date('2024-01-15'),
    duration: 45,
    score: 87,
    feedback: {
      strengths: [
        'Excellent understanding of React hooks and state management',
        'Clear communication of technical concepts',
        'Good problem-solving approach with structured thinking',
      ],
      improvements: [
        'Could elaborate more on system design decisions',
        'Consider discussing edge cases more proactively',
        'Practice explaining trade-offs in architectural choices',
      ],
      summary: 'Strong technical foundation with good communication skills. Focus on deepening system design knowledge.',
    },
  },
  {
    id: '2',
    title: 'Data Analyst Interview',
    company: 'Meta',
    jobType: 'Data Science',
    experienceLevel: 'Mid Level',
    date: new Date('2024-01-12'),
    duration: 35,
    score: 72,
    feedback: {
      strengths: [
        'Good SQL knowledge demonstrated',
        'Strong analytical thinking',
        'Well-structured responses',
      ],
      improvements: [
        'Need to improve statistical concepts explanation',
        'Practice more behavioral questions',
        'Work on connecting data insights to business impact',
      ],
      summary: 'Solid technical skills but needs more practice on connecting analysis to business outcomes.',
    },
  },
  {
    id: '3',
    title: 'Product Manager Interview',
    company: 'Amazon',
    jobType: 'Product Management',
    experienceLevel: 'Senior',
    date: new Date('2024-01-10'),
    duration: 50,
    score: 91,
    feedback: {
      strengths: [
        'Excellent customer-centric thinking',
        'Strong prioritization framework',
        'Great use of data to support decisions',
        'Leadership principles well demonstrated',
      ],
      improvements: [
        'Could be more concise in some responses',
        'Practice more technical depth questions',
      ],
      summary: 'Outstanding product sense and leadership qualities. Minor improvements in conciseness will perfect your delivery.',
    },
  },
  {
    id: '4',
    title: 'Backend Engineer Interview',
    company: 'Netflix',
    jobType: 'Software Engineering',
    experienceLevel: 'Lead',
    date: new Date('2024-01-08'),
    duration: 60,
    score: 65,
    feedback: {
      strengths: [
        'Good understanding of distributed systems',
        'Solid coding fundamentals',
      ],
      improvements: [
        'Need to improve system design communication',
        'Practice explaining complex architectures simply',
        'Work on time management during coding exercises',
        'Review CAP theorem applications',
      ],
      summary: 'Good fundamentals but needs significant work on system design communication and time management.',
    },
  },
  {
    id: '5',
    title: 'UX Designer Interview',
    company: 'Apple',
    jobType: 'Design',
    experienceLevel: 'Mid Level',
    date: new Date('2024-01-05'),
    duration: 40,
    score: 78,
    feedback: {
      strengths: [
        'Strong portfolio presentation',
        'Good understanding of user research methods',
        'Creative problem-solving demonstrated',
      ],
      improvements: [
        'Need to better articulate design decisions',
        'Practice presenting to stakeholders',
        'Work on accessibility considerations',
      ],
      summary: 'Creative and user-focused approach. Focus on strengthening stakeholder communication.',
    },
  },
];
