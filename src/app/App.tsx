import { Suspense, lazy } from 'react';
import { useHash } from '@/shared/useHash';
import { Site } from '@/showcase/Site';

const Playground = lazy(() => import('@/showcase/playground/Playground'));

/** Two routes: the shareable page, and `#play`, the tuning playground. */
export function App() {
  const hash = useHash();
  if (hash === 'play') {
    return (
      <Suspense fallback={null}>
        <Playground />
      </Suspense>
    );
  }
  return <Site tune={hash === 'tune'} />;
}
