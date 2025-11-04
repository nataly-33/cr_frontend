import { useState, useCallback, useMemo } from "react";

interface UseTableOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export const useTable = ({ initialPage = 1, initialPageSize = 10 }: UseTableOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortBy]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy(null);
    setSortOrder("asc");
    setCurrentPage(1);
  }, []);

  const getPaginationParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      ordering: sortBy ? `${sortOrder === "desc" ? "-" : ""}${sortBy}` : undefined,
    }),
    [currentPage, pageSize, searchQuery, sortBy, sortOrder]
  );

  return {
    currentPage,
    pageSize,
    searchQuery,
    sortBy,
    sortOrder,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort,
    resetFilters,
    getPaginationParams,
  };
};
