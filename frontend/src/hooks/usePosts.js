import { useEffect, useState } from 'react';
import { loadPosts, loadPost } from '../data/posts';

export function usePosts() {
  const [state, setState] = useState({ posts: [], loading: true, error: false });

  useEffect(() => {
    let alive = true;
    loadPosts()
      .then((posts) => alive && setState({ posts, loading: false, error: false }))
      .catch(() => alive && setState({ posts: [], loading: false, error: true }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function usePost(slug) {
  const [state, setState] = useState({ post: null, loading: true, error: false });

  useEffect(() => {
    let alive = true;
    setState({ post: null, loading: true, error: false });
    loadPost(slug)
      .then((post) => alive && setState({ post, loading: false, error: false }))
      .catch(() => alive && setState({ post: null, loading: false, error: true }));
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}
