import type { ScenarioId } from "./game-scenarios";

export type GameProgress = {
  visitedScenarioIds: ScenarioId[];
  flags: Record<string, boolean>;
};

export const INITIAL_GAME_PROGRESS: GameProgress = {
  visitedScenarioIds: ["hallway"],
  flags: {},
};
