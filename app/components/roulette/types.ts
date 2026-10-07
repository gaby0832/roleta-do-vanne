export type Media = {
  id: string;
  title: string;
  type: "filme" | "video";
  image: string | null;
  author?: string | null;
  youtuber?: string | null;
};

export type Participant = {
  id: string;
  username: string;
  avatar: string | null;

  midia1: Media;
  midia2: Media;
};

export type RouletteItem = {
  id: string;

  submissionId: string;

  username: string;
  avatar: string | null;

  media: Media;
};