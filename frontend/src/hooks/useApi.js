import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function useApi(path, fallback = []) {
  const [state, setState] = useState({ data: fallback, loading: Boolean(path), error: '' });
  useEffect(() => {
    if (!path) return;
    let active = true;
    api.get(path).then(data => active && setState({ data, loading: false, error: '' })).catch(error => active && setState({ data: fallback, loading: false, error: error.message }));
    return () => { active = false; };
  }, [path]);
  return state;
}
