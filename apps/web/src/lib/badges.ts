import type { QueryType } from "@/types/geometry";
import { QUERY_GROUPS, LEARNING_PATH } from "@/lib/query-meta";

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  isUnlocked: (progress: BadgeProgress) => boolean;
};

export type BadgeProgress = {
  visitedQueries: QueryType[];
  correctAnswerQueries: QueryType[];
  bestStreak: number;
};

const foundationsQueries = QUERY_GROUPS.find((g) => g.category === "Foundations")?.queries ?? [];

export const BADGES: Badge[] = [
  {
    id: "first-steps",
    emoji: "👣",
    name: "First Steps",
    description: "Open your first chapter.",
    isUnlocked: (p) => p.visitedQueries.length >= 1,
  },
  {
    id: "foundations-graduate",
    emoji: "🎓",
    name: "Foundations Graduate",
    description: "Explore every Foundations chapter.",
    isUnlocked: (p) => foundationsQueries.every((q) => p.visitedQueries.includes(q)),
  },
  {
    id: "sharp-shooter",
    emoji: "🎯",
    name: "Sharp Shooter",
    description: "Get 5 comprehension questions right.",
    isUnlocked: (p) => p.correctAnswerQueries.length >= 5,
  },
  {
    id: "perfect-ten",
    emoji: "🏆",
    name: "Perfect Ten",
    description: "Get 10 comprehension questions right.",
    isUnlocked: (p) => p.correctAnswerQueries.length >= 10,
  },
  {
    id: "on-a-roll",
    emoji: "🔥",
    name: "On a Roll",
    description: "Answer 5 comprehension questions right in a row.",
    isUnlocked: (p) => p.bestStreak >= 5,
  },
  {
    id: "halfway-there",
    emoji: "🚀",
    name: "Halfway There",
    description: "Explore half of every chapter in the lab.",
    isUnlocked: (p) => p.visitedQueries.length >= Math.ceil(LEARNING_PATH.length / 2),
  },
  {
    id: "geometry-explorer",
    emoji: "🌟",
    name: "Geometry Explorer",
    description: "Explore every single chapter.",
    isUnlocked: (p) => LEARNING_PATH.every((q) => p.visitedQueries.includes(q)),
  },
];
