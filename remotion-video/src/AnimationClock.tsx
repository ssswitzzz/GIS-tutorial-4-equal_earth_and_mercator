import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';

export const AnimationClock = createContext<number | null>(null);
// Authored animation time can exceed the shorter narration composition's range.
export const useAnimationFrame = () => {
  const timelineFrame = useCurrentFrame();
  return useContext(AnimationClock) ?? timelineFrame;
};
