import { Subject, Subcategory, Teacher, Course, Ad } from './types';

export const subjects: Subject[] = [
  { id: 'sub-bio', name: 'Biology', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000' },
  { id: 'sub-chem', name: 'Chemistry', imageUrl: 'https://images.unsplash.com/photo-1603126852583-09cb6cfbb7a3?auto=format&fit=crop&q=80&w=1000' },
  { id: 'sub-math', name: 'Combined Maths', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1000' },
  { id: 'sub-phy', name: 'Physics', imageUrl: 'https://images.unsplash.com/photo-1548484196-8eb556276161?auto=format&fit=crop&q=80&w=1000' },
];

export const subcategories: Subcategory[] = [
  { id: 'cat-theory', name: 'Theory' },
  { id: 'cat-revision', name: 'Revision' },
  { id: 'cat-paper', name: 'Paper Discussion' },
];

export const teachers: Teacher[] = [];

export const ads: Ad[] = [];

export const courses: Course[] = [];
