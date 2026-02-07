import fs from 'node:fs';
import path from 'node:path';
import type { GameMeta, GameContent } from './types';
import gamesData from '../data/games.json';

const GAMES_DIR = path.resolve('games');

export function getAllGames(): GameMeta[] {
  return gamesData as GameMeta[];
}

export function getGameBySlug(slug: string): GameMeta | undefined {
  return gamesData.find((g: GameMeta) => g.slug === slug);
}

export function getGameContent(slug: string): GameContent | null {
  const meta = getGameBySlug(slug);
  if (!meta) return null;

  const gameDir = path.join(GAMES_DIR, slug);
  const pitchPath = path.join(gameDir, 'pitch.md');

  if (!fs.existsSync(pitchPath)) return null;

  const pitchRaw = fs.readFileSync(pitchPath, 'utf-8');
  const sections = parsePitchSections(pitchRaw);

  const docNames = [
    { name: 'Game Design', slug: 'game-design', agent: 'REED' },
    { name: 'Narrative Bible', slug: 'narrative-bible', agent: 'NOVA' },
    { name: 'Art Direction', slug: 'art-direction', agent: 'PIXEL' },
    { name: 'Sound Design', slug: 'sound-design', agent: 'ECHO' },
    { name: 'Technical Architecture', slug: 'technical-architecture', agent: 'BYTE' },
    { name: 'Level Design', slug: 'level-design', agent: 'GRID' },
    { name: 'Production Plan', slug: 'production-plan', agent: 'CLOCK' },
    { name: 'QA Plan', slug: 'qa-plan', agent: 'CRASH' },
    { name: 'Marketing Plan', slug: 'marketing-plan', agent: 'HYPE' },
    { name: 'Release Plan', slug: 'release-plan', agent: 'SHIP' },
  ];

  const docs = docNames.map(d => ({
    ...d,
    available: fs.existsSync(path.join(gameDir, `${d.slug}.md`)),
  }));

  return { meta, pitch: pitchRaw, sections, docs };
}

function parsePitchSections(raw: string) {
  const sectionMap: Record<string, string> = {};
  const sectionHeaders = ['THE HOOK', 'THE CORE', 'THE HEART', 'THE MARKET', 'THE SCOPE'];

  for (let i = 0; i < sectionHeaders.length; i++) {
    const header = sectionHeaders[i];
    const nextHeader = sectionHeaders[i + 1];
    const startPattern = new RegExp(`## ${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const startMatch = raw.match(startPattern);

    if (!startMatch || startMatch.index === undefined) continue;

    const startIdx = startMatch.index + startMatch[0].length;
    let endIdx = raw.length;

    if (nextHeader) {
      const endPattern = new RegExp(`## ${nextHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      const endMatch = raw.slice(startIdx).match(endPattern);
      if (endMatch && endMatch.index !== undefined) {
        endIdx = startIdx + endMatch.index;
      }
    } else {
      // For the last section, try to find the next ## heading
      const nextHeading = raw.slice(startIdx).match(/\n## [A-Z]/);
      if (nextHeading && nextHeading.index !== undefined) {
        endIdx = startIdx + nextHeading.index;
      }
    }

    const key = header.replace('THE ', '').toLowerCase();
    sectionMap[key] = raw.slice(startIdx, endIdx).trim();
  }

  return {
    hook: sectionMap['hook'] || '',
    core: sectionMap['core'] || '',
    heart: sectionMap['heart'] || '',
    market: sectionMap['market'] || '',
    scope: sectionMap['scope'] || '',
  };
}

export function getAdjacentGames(slug: string): { prev: GameMeta | null; next: GameMeta | null } {
  const games = getAllGames();
  const idx = games.findIndex(g => g.slug === slug);
  return {
    prev: idx > 0 ? games[idx - 1] : null,
    next: idx < games.length - 1 ? games[idx + 1] : null,
  };
}

export function getGameDoc(slug: string, docSlug: string): string | null {
  const docPath = path.join(GAMES_DIR, slug, `${docSlug}.md`);
  if (!fs.existsSync(docPath)) return null;
  return fs.readFileSync(docPath, 'utf-8');
}
