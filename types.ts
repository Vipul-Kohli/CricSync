export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  venue: string;
  mapLink?: string;
  matchUrl?: string;
  selected: boolean;
  homeTeam?: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface ExtractionResult {
  matches: Match[];
  sources: Source[];
}

export type InputMode = 'search' | 'text' | 'image';

export interface TeamSearchQuery {
  searchType: 'details' | 'link';
  teamName: string;
  location: string;
  captainName: string;
  teamLink: string;
}

export interface GenerationConfig {
  tone: 'casual' | 'professional' | 'urgent';
  includePoll: boolean;
  deadline?: string;
}