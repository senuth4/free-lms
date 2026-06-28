export type Subject = {
  id: string;
  name: string; // Bio, Chem, Maths, Physics
  imageUrl: string;
};

export type Subcategory = {
  id: string;
  name: string; // Paper Discussion, Revision, Theory
};

export type Teacher = {
  id: string;
  name: string;
  subjectId: string;
  imageUrl: string;
  description: string;
  socials: {
    youtube?: string;
    facebook?: string;
    telegram?: string;
  };
};

export type Course = {
  id: string;
  title: string;
  subjectId: string;
  subcategoryId: string;
  teacherId: string;
  unit: string; // e.g. "Mechanics", "Organic Chemistry"
  thumbnailUrl: string;
  medium?: 'Sinhala' | 'English';
  links: {
    id: string;
    title: string;
    type: 'video' | 'pdf';
    url: string;
  }[];
  views: number;
};

export type Editor = { id: string };
export type Admin = { id: string };

export type Ad = {
  id: string;
  title: string;
  teacherId: string;
  imageUrl: string;
  description: string;
  linkUrl?: string;
  createdAt?: any;
};

export type Resource = {
  id: string;
  subject: string;
  unit: string;
  topic?: string;
  subtopic?: string;
  page?: string;
  textContent: string;
  searchTags?: string;
};

export type QuizQuestion = {
  id: string;
  type: 'mcq' | 'structured' | 'essay';
  text: string;
  imageUrl?: string;
  options?: string[]; // for mcq
  correctOptionIndex?: number; // for mcq
  hints?: string;
  markingScheme?: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  unit: string;
  medium: 'Sinhala' | 'English';
  timeLimitMins?: number;
  questions: QuizQuestion[];
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type QuizAttempt = {
  id: string;
  userId: string;
  quizId: string;
  score?: number;
  startedAt: any;
  completedAt?: any;
  isDailyChallenge?: boolean;
  pointsAwarded?: number;
  answers: {
     questionId: string;
     selectedOptionIndex?: number;
     textAnswer?: string;
  }[];
};

export type DailyChallenge = {
  id: string;
  quizId: string; // references a Quiz
  activeDate: string; // YYYY-MM-DD
  points: number;
  createdAt: any;
};

export type UserProfile = {
  id: string;
  displayName: string;
  photoURL?: string;
  points: number;
  lastActive: any;
};

export type LiveSession = {
  id: string;
  title: string;
  teacherId: string;
  subjectId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  scheduledAt: any;
  status: 'upcoming' | 'live' | 'ended';
  description?: string;
  createdAt?: any;
};

