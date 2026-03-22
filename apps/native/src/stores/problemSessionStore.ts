import { components } from '@schema';
import { create } from 'zustand';

type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];

type SessionPhase =
  | 'MAIN_PROBLEM'
  | 'MAIN_PROBLEM_RETRY'
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

type SessionMeta = { publishId?: number; publishAt?: string };

type ProblemSessionActions = {
  init: (group: PublishProblemGroupResp, meta?: SessionMeta) => void;
  initWithResume: (group: PublishProblemGroupResp, meta?: SessionMeta) => void;

  finishMain: (isCorrect: boolean) => void;
  finishMainRetry: () => void;
  finishChildProblem: () => void;
  nextPointing: () => void;

  goToAnalysis: () => void;
  reset: () => void;
};

const INITIAL_INDEX = -1;

export const MAX_RETRY_ATTEMPTS = 3;

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

type LastProgressInfo = components['schemas']['LastProgressInfo'];

type ResumeState = Pick<
  ProblemSessionState,
  'phase' | 'childIndex' | 'pointingIndex' | 'pointingTarget' | 'mainCorrect'
>;

const getChildProblems = (group?: PublishProblemGroupResp) => group?.childProblems ?? [];
const getMainPointings = (group?: PublishProblemGroupResp) => group?.problem.pointings ?? [];

const findChildIndexByNo = (
  children: ProblemWithStudyInfoResp[],
  no: number | undefined | null
): number => {
  if (no == null) return INITIAL_INDEX;
  return children.findIndex((c) => c.no === no);
};

const isPointingCompleted = (p: PointingWithFeedbackResp): boolean =>
  p.isQuestionUnderstood != null && p.isCommentUnderstood != null;

const countAnsweredChildPointings = (children: ProblemWithStudyInfoResp[]): number =>
  children.reduce(
    (sum, child) => sum + (child.pointings ?? []).filter(isPointingCompleted).length,
    0
  );

const computeResumeState = (
  group: PublishProblemGroupResp,
  info: LastProgressInfo
): ResumeState => {
  const children = getChildProblems(group);
  const mainPointings = getMainPointings(group);
  const isMainCorrect =
    group.problem.progress === 'CORRECT' || group.problem.progress === 'SEMI_CORRECT';

  if (!info.isMainProblemSolved) {
    return {
      phase: 'MAIN_PROBLEM',
      childIndex: INITIAL_INDEX,
      pointingIndex: INITIAL_INDEX,
      pointingTarget: undefined,
      mainCorrect: undefined,
    };
  }

  const mainAttemptCount = group.attemptCount ?? group.problem.attemptCount ?? 0;
  const mainHasRetry = !isMainCorrect && mainAttemptCount < MAX_RETRY_ATTEMPTS;

  if (mainHasRetry) {
    return {
      phase: 'MAIN_PROBLEM',
      childIndex: INITIAL_INDEX,
      pointingIndex: INITIAL_INDEX,
      pointingTarget: undefined,
      mainCorrect: undefined,
    };
  }

  if (isMainCorrect) {
    for (let i = 0; i < children.length; i += 1) {
      const cPointings = children[i].pointings ?? [];
      if (cPointings.length === 0) continue;
      const nextPIdx = cPointings.findIndex((p) => !isPointingCompleted(p));
      if (nextPIdx !== -1) {
        return {
          phase: 'CHILD_POINTINGS',
          childIndex: i,
          pointingIndex: nextPIdx,
          pointingTarget: 'CHILD',
          mainCorrect: true,
        };
      }
    }

    const mainNextPIdx = mainPointings.findIndex((p) => !isPointingCompleted(p));
    if (mainNextPIdx !== -1) {
      return {
        phase: 'MAIN_POINTINGS',
        childIndex: INITIAL_INDEX,
        pointingIndex: mainNextPIdx,
        pointingTarget: 'MAIN',
        mainCorrect: true,
      };
    }

    return {
      phase: 'ANALYSIS',
      childIndex: INITIAL_INDEX,
      pointingIndex: INITIAL_INDEX,
      pointingTarget: undefined,
      mainCorrect: true,
    };
  }

  const totalChildren = info.totalChildProblemCount ?? children.length;
  const solvedChildren = info.solvedChildProblemCount ?? 0;

  if (totalChildren > 0 && solvedChildren < totalChildren) {
    const lastChildNo = info.lastSolvedChildProblemNo;
    if (lastChildNo == null) {
      return {
        phase: 'CHILD_PROBLEM',
        childIndex: 0,
        pointingIndex: INITIAL_INDEX,
        pointingTarget: undefined,
        mainCorrect: false,
      };
    }

    const lastChildIdx = findChildIndexByNo(children, lastChildNo);
    if (lastChildIdx !== -1) {
      const child = children[lastChildIdx];
      const childAttempts = child.attemptCount ?? 0;
      const childCorrect = child.progress === 'CORRECT' || child.progress === 'SEMI_CORRECT';
      if (!childCorrect && childAttempts < MAX_RETRY_ATTEMPTS) {
        return {
          phase: 'CHILD_PROBLEM',
          childIndex: lastChildIdx,
          pointingIndex: INITIAL_INDEX,
          pointingTarget: undefined,
          mainCorrect: false,
        };
      }

      const cPointings = child.pointings ?? [];
      const nextPIdx = cPointings.findIndex((p) => !isPointingCompleted(p));
      if (nextPIdx !== -1) {
        return {
          phase: 'CHILD_POINTINGS',
          childIndex: lastChildIdx,
          pointingIndex: nextPIdx,
          pointingTarget: 'CHILD',
          mainCorrect: false,
        };
      }
    }

    const nextChildIdx = lastChildIdx + 1;
    if (nextChildIdx < children.length) {
      return {
        phase: 'CHILD_PROBLEM',
        childIndex: nextChildIdx,
        pointingIndex: INITIAL_INDEX,
        pointingTarget: undefined,
        mainCorrect: false,
      };
    }
  }

  if (totalChildren > 0 && solvedChildren >= totalChildren) {
    const answeredChildPointingCount = countAnsweredChildPointings(children);
    const totalChildPointingCount = children.reduce((s, c) => s + (c.pointings ?? []).length, 0);
    const childPointingsDone = answeredChildPointingCount >= totalChildPointingCount;

    if (!childPointingsDone) {
      for (let i = 0; i < children.length; i += 1) {
        const cPointings = children[i].pointings ?? [];
        const nextPIdx = cPointings.findIndex((p) => !isPointingCompleted(p));
        if (nextPIdx !== -1) {
          return {
            phase: 'CHILD_POINTINGS',
            childIndex: i,
            pointingIndex: nextPIdx,
            pointingTarget: 'CHILD',
            mainCorrect: false,
          };
        }
      }
    }

    const mainNextPIdx = mainPointings.findIndex((p) => !isPointingCompleted(p));
    if (mainNextPIdx !== -1 && mainNextPIdx > 0) {
      return {
        phase: 'MAIN_POINTINGS',
        childIndex: INITIAL_INDEX,
        pointingIndex: mainNextPIdx,
        pointingTarget: 'MAIN',
        mainCorrect: false,
      };
    }

    if (mainNextPIdx === 0 || mainPointings.every((p) => !isPointingCompleted(p))) {
      return {
        phase: 'MAIN_PROBLEM_RETRY',
        childIndex: INITIAL_INDEX,
        pointingIndex: INITIAL_INDEX,
        pointingTarget: undefined,
        mainCorrect: false,
      };
    }

    return {
      phase: 'ANALYSIS',
      childIndex: INITIAL_INDEX,
      pointingIndex: INITIAL_INDEX,
      pointingTarget: undefined,
      mainCorrect: false,
    };
  }

  const mainNextPIdx = mainPointings.findIndex((p) => !isPointingCompleted(p));
  if (mainNextPIdx !== -1) {
    return {
      phase: 'MAIN_POINTINGS',
      childIndex: INITIAL_INDEX,
      pointingIndex: mainNextPIdx,
      pointingTarget: 'MAIN',
      mainCorrect: false,
    };
  }

  return {
    phase: 'ANALYSIS',
    childIndex: INITIAL_INDEX,
    pointingIndex: INITIAL_INDEX,
    pointingTarget: undefined,
    mainCorrect: false,
  };
};

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
    initWithResume: (group, meta) => {
      if (group.progress !== 'DOING' || !group.lastProgressInfo) {
        set({
          ...initialState,
          initialized: true,
          group,
          publishId: meta?.publishId,
          publishAt: meta?.publishAt,
          phase: 'MAIN_PROBLEM',
        });
        return;
      }

      const resumeState = computeResumeState(group, group.lastProgressInfo);
      set({
        ...initialState,
        initialized: true,
        group,
        publishId: meta?.publishId,
        publishAt: meta?.publishAt,
        ...resumeState,
      });
    },
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
    finishMainRetry: () => {
      const { group } = get();
      if (!group) {
        return;
      }
      const mainPointings = getMainPointings(group);
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
    finishChildProblem: () => {
      const { group, childIndex } = get();
      if (!group || childIndex < 0) {
        return;
      }
      const childProblems = getChildProblems(group);
      const child = childProblems[childIndex];
      const childPointings = child?.pointings ?? [];

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

      // 오답 경로: 모든 새끼문항 완료 → 메인 재풀이
      set({
        phase: 'MAIN_PROBLEM_RETRY',
        childIndex: INITIAL_INDEX,
        pointingTarget: undefined,
        pointingIndex: INITIAL_INDEX,
      });
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

        // 오답 경로: 모든 새끼문항 포인팅 완료 → 메인 재풀이
        set({
          phase: 'MAIN_PROBLEM_RETRY',
          childIndex: INITIAL_INDEX,
          pointingTarget: undefined,
          pointingIndex: INITIAL_INDEX,
        });
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

export const getInitialScreenForPhase = (
  phase: SessionPhase
): 'Problem' | 'Pointing' | 'Analysis' => {
  switch (phase) {
    case 'MAIN_PROBLEM':
    case 'MAIN_PROBLEM_RETRY':
    case 'CHILD_PROBLEM':
      return 'Problem';
    case 'CHILD_POINTINGS':
    case 'MAIN_POINTINGS':
      return 'Pointing';
    case 'ANALYSIS':
    case 'DONE':
      return 'Analysis';
  }
};

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
    state.phase === 'MAIN_PROBLEM_RETRY' ||
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
