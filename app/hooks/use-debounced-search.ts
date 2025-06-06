import { useState, useEffect } from "react";

export function useDebouncedSearch(delay: number = 500) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [search, delay]);

  return {
    search,
    debouncedSearch,
    setSearch,
  };
}

export default useDebouncedSearch;
