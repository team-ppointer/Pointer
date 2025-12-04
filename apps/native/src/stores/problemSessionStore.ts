import { components } from '@schema';
import { create } from 'zustand';

type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];

type SessionPhase =
  | 'MAIN_PROBLEM'
  | 'CHILD_PROBLEM'
  | 'CHILD_POINTINGS'
  | 'MAIN_POINTINGS'
  | 'ANALYSIS'
  | 'DONE';

type PointingTarget = 'MAIN' | 'CHILD';

type ProblemSessionState = {
  initialized: boolean;
  group?: PublishProblemGroupResp;
  publishId?: number;
  publishAt?: string;

  phase: SessionPhase;

  childIndex: number;
  pointingIndex: number;
  pointingTarget?: PointingTarget;
  mainCorrect?: boolean;
};

type ProblemSessionActions = {
  init: (group: PublishProblemGroupResp, meta?: { publishId?: number; publishAt?: string }) => void;

  finishMain: (isCorrect: boolean) => void;
  finishChildProblem: () => void;
  nextPointing: () => void;

  goToAnalysis: () => void;
  reset: () => void;
};

const INITIAL_INDEX = -1;

const initialState: ProblemSessionState = {
  initialized: false,
  group: undefined,
  publishId: undefined,
  publishAt: undefined,
  phase: 'MAIN_PROBLEM',
  childIndex: INITIAL_INDEX,
  pointingIndex: INITIAL_INDEX,
  pointingTarget: undefined,
  mainCorrect: undefined,
};

const getChildProblems = (group?: PublishProblemGroupResp) => group?.childProblems ?? [];
const getMainPointings = (group?: PublishProblemGroupResp) => group?.problem.pointings ?? [];

export const useProblemSessionStore = create<ProblemSessionState & ProblemSessionActions>(
  (set, get) => ({
    ...initialState,
    init: (group, meta) =>
      set({
        ...initialState,
        initialized: true,
        group,
        publishId: meta?.publishId,
        publishAt: meta?.publishAt,
        phase: 'MAIN_PROBLEM',
      }),
    finishMain: (isCorrect) => {
      const { group } = get();
      if (!group) {
        return;
      }

      const childProblems = getChildProblems(group);
      const mainPointings = getMainPointings(group);

      if (isCorrect) {
        const firstChildIndex = childProblems.findIndex(
          (child) => (child.pointings?.length ?? 0) > 0
        );
        if (firstChildIndex !== -1) {
          set({
            mainCorrect: true,
            phase: 'CHILD_POINTINGS',
            childIndex: firstChildIndex,
            pointingTarget: 'CHILD',
            pointingIndex: 0,
          });
          return;
        }

        if (mainPointings.length > 0) {
          set({
            mainCorrect: true,
            phase: 'MAIN_POINTINGS',
            pointingTarget: 'MAIN',
            pointingIndex: 0,
          });
        } else {
          set({
            mainCorrect: true,
            phase: 'ANALYSIS',
            pointingTarget: undefined,
            pointingIndex: INITIAL_INDEX,
          });
        }
        return;
      }

      if (childProblems.length > 0) {
        set({
          mainCorrect: false,
          phase: 'CHILD_PROBLEM',
          childIndex: 0,
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
        return;
      }

      if (mainPointings.length > 0) {
        set({
          mainCorrect: false,
          phase: 'MAIN_POINTINGS',
          pointingTarget: 'MAIN',
          pointingIndex: 0,
        });
      } else {
        set({
          mainCorrect: false,
          phase: 'ANALYSIS',
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
      }
    },
    finishChildProblem: () => {
      const { group, childIndex } = get();
      if (!group || childIndex < 0) {
        return;
      }
      const childProblems = getChildProblems(group);
      const child = childProblems[childIndex];
      const childPointings = child?.pointings ?? [];
      const mainPointings = getMainPointings(group);

      if (childPointings.length > 0) {
        set({
          phase: 'CHILD_POINTINGS',
          pointingTarget: 'CHILD',
          pointingIndex: 0,
        });
        return;
      }

      const nextChildIndex = childIndex + 1;
      if (nextChildIndex < childProblems.length) {
        set({
          phase: 'CHILD_PROBLEM',
          childIndex: nextChildIndex,
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
        return;
      }

      if (mainPointings.length > 0) {
        set({
          phase: 'MAIN_POINTINGS',
          pointingTarget: 'MAIN',
          pointingIndex: 0,
        });
      } else {
        set({
          phase: 'ANALYSIS',
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
      }
    },
    nextPointing: () => {
      const state = get();
      const { group, phase, childIndex, pointingTarget, pointingIndex, mainCorrect } = state;
      if (!group || !pointingTarget) {
        return;
      }

      const mainPointings = getMainPointings(group);
      const childProblems = getChildProblems(group);
      const currentChild = childIndex >= 0 ? childProblems[childIndex] : undefined;
      const currentPointings =
        pointingTarget === 'MAIN' ? mainPointings : (currentChild?.pointings ?? []);

      const nextPointingIndex = pointingIndex + 1;
      if (nextPointingIndex < currentPointings.length) {
        set({ pointingIndex: nextPointingIndex });
        return;
      }

      if (phase === 'CHILD_POINTINGS') {
        const nextChildIndex = childIndex + 1;
        if (mainCorrect) {
          for (let i = nextChildIndex; i < childProblems.length; i += 1) {
            if ((childProblems[i].pointings?.length ?? 0) > 0) {
              set({
                phase: 'CHILD_POINTINGS',
                childIndex: i,
                pointingTarget: 'CHILD',
                pointingIndex: 0,
              });
              return;
            }
          }

          if (mainPointings.length > 0) {
            set({
              phase: 'MAIN_POINTINGS',
              pointingTarget: 'MAIN',
              pointingIndex: 0,
            });
          } else {
            set({
              phase: 'ANALYSIS',
              pointingTarget: undefined,
              pointingIndex: INITIAL_INDEX,
            });
          }
          return;
        }

        if (nextChildIndex < childProblems.length) {
          set({
            phase: 'CHILD_PROBLEM',
            childIndex: nextChildIndex,
            pointingTarget: undefined,
            pointingIndex: INITIAL_INDEX,
          });
          return;
        }

        if (mainPointings.length > 0) {
          set({
            phase: 'MAIN_POINTINGS',
            pointingTarget: 'MAIN',
            pointingIndex: 0,
          });
        } else {
          set({
            phase: 'ANALYSIS',
            pointingTarget: undefined,
            pointingIndex: INITIAL_INDEX,
          });
        }
        return;
      }

      if (phase === 'MAIN_POINTINGS') {
        set({
          phase: 'ANALYSIS',
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
      }
    },
    goToAnalysis: () =>
      set({
        phase: 'ANALYSIS',
        pointingTarget: undefined,
        pointingIndex: INITIAL_INDEX,
      }),
    reset: () => set(initialState),
  })
);

export const selectInitialized = (state: ProblemSessionState) => state.initialized;
export const selectGroup = (state: ProblemSessionState) => state.group;
export const selectPublishId = (state: ProblemSessionState) => state.publishId;
export const selectPublishAt = (state: ProblemSessionState) => state.publishAt;
export const selectPhase = (state: ProblemSessionState) => state.phase;
export const selectChildIndex = (state: ProblemSessionState) => state.childIndex;

export const selectCurrentProblem = (
  state: ProblemSessionState
): ProblemWithStudyInfoResp | undefined => {
  const { group } = state;
  if (!group) {
    return undefined;
  }
  if (
    state.phase === 'MAIN_PROBLEM' ||
    state.phase === 'MAIN_POINTINGS' ||
    state.phase === 'ANALYSIS'
  ) {
    return group.problem;
  }
  if (state.phase === 'CHILD_PROBLEM' || state.phase === 'CHILD_POINTINGS') {
    return group.childProblems?.[state.childIndex];
  }
  return undefined;
};

export const selectCurrentPointing = (
  state: ProblemSessionState
): PointingWithFeedbackResp | undefined => {
  const { group, pointingTarget, pointingIndex, childIndex } = state;
  if (!group || pointingTarget == null || pointingIndex < 0) {
    return undefined;
  }
  if (pointingTarget === 'MAIN') {
    return group.problem.pointings?.[pointingIndex];
  }
  const child = group.childProblems?.[childIndex];
  return child?.pointings?.[pointingIndex];
};
