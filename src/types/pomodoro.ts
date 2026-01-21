export type PomodoroPhase = "idle" | "work" | "break" | "paused" | "completed";

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  pushupTarget: number; // pushups per break
}

export interface PomodoroSessionState {
  phase: PomodoroPhase;
  previousPhase?: PomodoroPhase; // for resume after pause
  timeRemaining: number; // in seconds
  currentCycle: number;
  totalCycles: number;
  settings: PomodoroSettings;
  totalPushups: number;
  pushupLog: number[]; // pushups added per break
  startedAt: string; // ISO timestamp
  pausedAt?: string; // ISO timestamp when paused
  phaseStartedAt?: string; // ISO timestamp when current phase started (for background timing)
}

export interface PomodoroSummary {
  totalTime: number; // in seconds
  totalPushups: number;
  cyclesCompleted: number;
  workTime: number; // total work time in seconds
  breakTime: number; // total break time in seconds
  pushupLog: number[];
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  pushupTarget: 10,
};

export const POMODORO_STORAGE_KEY = "pomodoro_session";
