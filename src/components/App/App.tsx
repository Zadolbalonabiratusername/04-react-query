import { useState, useEffect } from "react";
import { fetchMovies } from "../../services/movieService";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import type { Movie } from "../../types/movie";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import s from "./App.module.css";

const App = () => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState<Movie | null>(null);
  const closeModal = () => setIsModalOpen(null);
  const openModal = (movie: Movie) => setIsModalOpen(movie);

  const { data, isLoading, isError, isSuccess, isFetching } = useQuery({
    queryKey: ["movies", query, currentPage],
    queryFn: () => fetchMovies(query, currentPage),
    enabled: query.trim() !== "",
    placeholderData: keepPreviousData,
  });

  const handleSearch = (search: string) => {
    setQuery(search);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (data?.results.length === 0) {
      toast.error("No movies found for your request.", {
        duration: 2900,
        position: "bottom-right",
      });
    }
  }, [data]);

  return (
    <div className={s.app}>
      <SearchBar onSubmit={handleSearch} />
      <Toaster />
      {isError && <ErrorMessage />}
      {isLoading && isFetching && <Loader />}

      {isSuccess && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={s.pagination}
          activeClassName={s.active}
          nextLabel="→"
          previousLabel="←"
          renderOnZeroPageCount={null}
        />
      )}

      {isSuccess && data.results.length > 0 && (
        <MovieGrid onSelect={openModal} movies={data.results} />
      )}

      {isModalOpen && <MovieModal onClose={closeModal} movie={isModalOpen} />}
    </div>
  );
};

export default App;
