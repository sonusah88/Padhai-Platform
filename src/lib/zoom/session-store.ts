export interface LiveClassSession {
  id: string;
  title: string;
  topic: string;
  description: string;
  subject: string;
  subjectNe: string;
  grade: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRole: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'live' | 'upcoming' | 'ended';
  meetingNumber: string;
  passcode: string;
  hostEmail?: string;
  attendeesCount: number;
  maxParticipants: number;
  recordingUrl?: string;
  resources: {
    id: string;
    title: string;
    type: 'pdf' | 'slides' | 'worksheet' | 'link';
    size?: string;
    url: string;
  }[];
  announcement?: string;
}

// Global in-memory live class sessions store with default curriculum classes
export const mockLiveSessions: LiveClassSession[] = [
  {
    id: '1',
    title: 'Linear Equations — Solving for x & Graphical Representation',
    topic: 'Algebra & Linear Equations',
    description: 'Master solving multi-step linear equations, word problems from the NEB syllabus, and understanding algebraic graphs intuitively with interactive examples.',
    subject: 'Mathematics',
    subjectNe: 'गणित',
    grade: 'Grade 8',
    teacherName: 'Ram Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    teacherRole: 'Senior Math Faculty, Kathmandu',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Started 15 mins ago (LIVE NOW)
    durationMinutes: 60,
    status: 'live',
    meetingNumber: '84920481920',
    passcode: 'padhai123',
    hostEmail: 'ram.sharma@padhai.edu.np',
    attendeesCount: 48,
    maxParticipants: 100,
    resources: [
      {
        id: 'r1',
        title: 'Class Lecture Slides — Linear Equations.pdf',
        type: 'pdf',
        size: '2.4 MB',
        url: '#',
      },
      {
        id: 'r2',
        title: 'Formula & Shortcut Sheet.pdf',
        type: 'pdf',
        size: '1.1 MB',
        url: '#',
      },
      {
        id: 'r3',
        title: 'Practice Problem Set — 15 Questions.pdf',
        type: 'worksheet',
        size: '850 KB',
        url: '#',
      },
    ],
    announcement: 'Welcome everyone! Please open Chapter 4 in your textbook. We will solve 5 past SEE board questions together today.',
  },
  {
    id: '2',
    title: 'Optics: Refraction of Light, Snell\'s Law & Lens Formula',
    topic: 'Light & Optics',
    description: 'Complete breakdown of refraction through glass slab and prism, derivation of Snell\'s law, ray diagrams for convex and concave lenses with numerical practice.',
    subject: 'Science',
    subjectNe: 'विज्ञान',
    grade: 'Grade 10 (SEE)',
    teacherName: 'Dr. Sita Adhikari',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    teacherRole: 'Physics Educator & Curriculum Specialist',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // Starts in 45 mins
    durationMinutes: 75,
    status: 'upcoming',
    meetingNumber: '92837482910',
    passcode: 'optics2026',
    hostEmail: 'sita.adhikari@padhai.edu.np',
    attendeesCount: 92,
    maxParticipants: 200,
    resources: [
      {
        id: 'r4',
        title: 'Optics Ray Diagram Handbook.pdf',
        type: 'pdf',
        size: '3.8 MB',
        url: '#',
      },
      {
        id: 'r5',
        title: 'SEE Model Numerical Questions.pdf',
        type: 'worksheet',
        size: '1.2 MB',
        url: '#',
      },
    ],
    announcement: 'Class starts in 45 minutes. Keep a ruler, pencil, and calculator ready for ray diagrams and numericals.',
  },
  {
    id: '3',
    title: 'English Grammar: Reported Speech & Active-Passive Voice Mastery',
    topic: 'Grammar & Composition',
    description: 'Transform complex direct speech sentences into reported speech and master rules for passive voice with high-scoring tips for board examinations.',
    subject: 'English',
    subjectNe: 'अंग्रेजी',
    grade: 'Grade 9',
    teacherName: 'Prakash Thapa',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    teacherRole: 'English Language Trainer',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // Starts in 3 hours
    durationMinutes: 60,
    status: 'upcoming',
    meetingNumber: '73920194820',
    passcode: 'english99',
    hostEmail: 'prakash.thapa@padhai.edu.np',
    attendeesCount: 34,
    maxParticipants: 100,
    resources: [
      {
        id: 'r6',
        title: 'Rules Cheat Sheet — Voice & Speech.pdf',
        type: 'pdf',
        size: '1.5 MB',
        url: '#',
      },
    ],
    announcement: 'We will conduct a live 10-question speed quiz during the last 15 minutes of the class.',
  },
  {
    id: '4',
    title: 'Electromagnetic Induction & Faraday\'s Laws of Induction',
    topic: 'Electromagnetism',
    description: 'Concept of magnetic flux, Faraday\'s experiments, Lenz\'s law, self and mutual induction with real-world transformer physics.',
    subject: 'Physics',
    subjectNe: 'भौतिक विज्ञान',
    grade: '+2 Science',
    teacherName: 'Prof. Ramesh Karki',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    teacherRole: 'Department Head of Physics',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    durationMinutes: 90,
    status: 'ended',
    meetingNumber: '64829104928',
    passcode: 'physics12',
    hostEmail: 'ramesh.karki@padhai.edu.np',
    attendeesCount: 118,
    maxParticipants: 150,
    recordingUrl: 'https://customer-example.cloudflarestream.com/demo/manifest/video.m3u8',
    resources: [
      {
        id: 'r7',
        title: 'Complete Lecture Recording Transcript & Notes.pdf',
        type: 'pdf',
        size: '4.2 MB',
        url: '#',
      },
    ],
    announcement: 'The class recording and whiteboard annotations are now available for revision.',
  },
];

let liveSessionsState = [...mockLiveSessions];

export function getAllLiveSessions(): LiveClassSession[] {
  return liveSessionsState;
}

export function getLiveSessionById(id: string): LiveClassSession | undefined {
  return liveSessionsState.find((session) => session.id === id);
}

export function createNewLiveSession(data: Partial<LiveClassSession>): LiveClassSession {
  const newId = String(Date.now());
  const randomMeetingNumber = String(Math.floor(10000000000 + Math.random() * 90000000000));
  const randomPasscode = Math.random().toString(36).substring(2, 8);

  const newSession: LiveClassSession = {
    id: newId,
    title: data.title || 'Live Interactive Class',
    topic: data.topic || data.title || 'General Discussion',
    description: data.description || 'Live interactive class session on Padhai platform.',
    subject: data.subject || 'Mathematics',
    subjectNe: data.subjectNe || 'गणित',
    grade: data.grade || 'Grade 10',
    teacherName: data.teacherName || 'Teacher',
    teacherAvatar: data.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    teacherRole: data.teacherRole || 'Faculty Member',
    scheduledAt: data.scheduledAt || new Date().toISOString(),
    durationMinutes: data.durationMinutes || 60,
    status: (data.status as 'live' | 'upcoming' | 'ended') || 'live',
    meetingNumber: data.meetingNumber || randomMeetingNumber,
    passcode: data.passcode || randomPasscode,
    hostEmail: data.hostEmail || 'teacher@padhai.edu.np',
    attendeesCount: data.attendeesCount || 1,
    maxParticipants: data.maxParticipants || 100,
    resources: data.resources || [],
    announcement: data.announcement || 'Welcome to the live class! Feel free to ask questions in the chat.',
  };

  liveSessionsState = [newSession, ...liveSessionsState];
  return newSession;
}

export function updateLiveSession(id: string, updates: Partial<LiveClassSession>): LiveClassSession | null {
  const index = liveSessionsState.findIndex((s) => s.id === id);
  if (index === -1) return null;

  liveSessionsState[index] = {
    ...liveSessionsState[index],
    ...updates,
  };
  return liveSessionsState[index];
}
