import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

export function useApi(path, fallback = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ data: fallback, loading: Boolean(path), error: '' });

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) return;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(path)
      .then(data => active && setState({ data, loading: false, error: '' }))
      .catch(error => active && setState({ data: fallback, loading: false, error: error.message }));

    return () => { active = false; };
  }, [path, tick]);

  return { ...state, refetch };
}