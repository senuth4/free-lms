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
  links: {
    id: string;
    title: string;
    type: 'video' | 'pdf';
    url: string;
  }[];
  views: number;
};

export type Ad = {
  id: string;
  title: string;
  teacherId: string;
  imageUrl: string;
  description: string;
};
