export interface GameMeta {
  slug: string;
  number: string;
  title: string;
  comparable: string;
  elevator: string;
  scrollStop: string;
  genre: string[];
  industry: string;
  accent: string;
}

export interface GameContent {
  meta: GameMeta;
  pitch: string;
  sections: {
    hook: string;
    core: string;
    heart: string;
    market: string;
    scope: string;
  };
  docs: {
    name: string;
    slug: string;
    available: boolean;
  }[];
}

export interface TeamMember {
  codename: string;
  role: string;
  catchphrase: string;
  philosophy: string;
}
