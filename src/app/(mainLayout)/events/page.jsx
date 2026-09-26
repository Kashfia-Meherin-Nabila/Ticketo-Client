"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import toast from "react-hot-toast";
import { BiSearch } from "react-icons/bi";
import { FiRotateCcw, FiCalendar } from "react-icons/fi";

import EventCard from "@/components/EventCard";

import { publicEvents } from "@/lib/api/events/data";

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const limit = 8;

  // ==========================================
  // LOAD EVENTS
  // ==========================================

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        const data = await publicEvents({
          page,
          limit,
          search,
        });

        setEvents(
          Array.isArray(data?.events)
            ? data.events
            : []
        );

        setTotalPages(
          Number(data?.totalPages) || 1
        );

        setTotal(
          Number(data?.total) || 0
        );
      } catch (error) {
        console.error("Events error:", error);

        toast.error(
          error?.message || "Failed to load events"
        );

        setEvents([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [page, search]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  // ==========================================
  // RESET SEARCH
  // ==========================================

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen pb-16">

      {/* ======================================
          HERO
      ====================================== */}

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-indigo-950/80 via-slate-950 to-violet-950/50 px-6 py-10 md:px-10 md:py-12">

        {/* Decorative glow */}

        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
            <FiCalendar size={14} />
            Discover something amazing
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl">
            Find Your Next
            <span className="block bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Unforgettable Event
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Explore concerts, workshops, conferences and
            experiences happening around you.
          </p>

        </div>

        {/* Stats */}

        <div className="relative z-10 mt-8">

          <div className="inline-block rounded-xl border border-white/10 bg-white/4 px-5 py-3 backdrop-blur-md">

            <p className="text-xl font-bold text-white">
              {total}
            </p>

            <p className="text-xs text-slate-500">
              Available Events
            </p>

          </div>

        </div>

      </section>

      {/* ======================================
          SEARCH
      ====================================== */}

      <Card
        className="
          mt-6
          rounded-2xl
          border
          border-white/10
          bg-slate-950/70
          p-5
          shadow-2xl
          shadow-black/20
          md:p-6
        "
      >

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >

          {/* Search Input */}

          <div className="relative flex-1">

            <BiSearch
              size={18}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                z-10
                -translate-y-1/2
                text-slate-500
              "
            />

            <Input
              id="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search event title..."
              aria-label="Search event title"
              className="w-full pl-10"
            />

          </div>

          {/* Search Button */}

          <Button
            type="submit"
            radius="lg"
            className="
              h-10
              bg-indigo-600
              px-6
              font-semibold
              text-white
              shadow-lg
              shadow-indigo-600/20
              transition
              hover:bg-indigo-500
            "
          >
            <BiSearch size={18} />
            Search
          </Button>

          {/* Reset Button */}

          <Button
            type="button"
            isIconOnly
            radius="lg"
            aria-label="Reset search"
            onPress={handleReset}
            className="
              h-10
              w-10
              shrink-0
              border
              border-white/10
              bg-white/4
              text-slate-300
              transition
              hover:bg-white/8
            "
          >
            <FiRotateCcw size={17} />
          </Button>

        </form>

      </Card>

      {/* ======================================
          RESULTS HEADER
      ====================================== */}

      <div className="mb-6 mt-10">

        <div className="flex items-center gap-3">

          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            Upcoming Events
          </h2>

          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            {total}
          </span>

        </div>

        <p className="mt-2 text-sm text-slate-500">
          Discover events you don&apos;t want to miss.
        </p>

      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >

          {Array.from({ length: 8 }).map(
            (_, index) => (

              <Card
                key={index}
                className="
                  h-107.5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/5
                  bg-slate-950/70
                "
              >

                <div className="h-56 animate-pulse bg-white/4" />

                <div className="space-y-4 p-5">

                  <div className="h-4 w-20 animate-pulse rounded bg-white/6" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-white/6" />

                  <div className="h-4 w-full animate-pulse rounded bg-white/4" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/4" />

                </div>

              </Card>

            )
          )}

        </div>

      ) : events.length === 0 ? (

        /* ====================================
           EMPTY STATE
        ==================================== */

        <Card
          className="
            rounded-2xl
            border
            border-white/10
            bg-slate-950/60
          "
        >

          <div className="flex flex-col items-center justify-center px-6 py-24 text-center">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <FiCalendar size={28} />
            </div>

            <h3 className="text-2xl font-bold text-white">
              No events found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn&apos;t find any events matching your
              search.
            </p>

            <Button
              onPress={handleReset}
              radius="lg"
              className="
                mt-6
                bg-indigo-600
                px-6
                font-semibold
                text-white
                hover:bg-indigo-500
              "
            >
              Clear Search
            </Button>

          </div>

        </Card>

      ) : (

        /* ====================================
           EVENTS
        ==================================== */

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >

          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
            />
          ))}

        </div>

      )}

      {/* ======================================
          PAGINATION
      ====================================== */}

      {!loading &&
        events.length > 0 &&
        totalPages > 1 && (

          <div
            className="
              mt-12
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            "
          >

            {/* Previous */}

            <Button
              isDisabled={page === 1}
              onPress={() =>
                handlePageChange(
                  Math.max(page - 1, 1)
                )
              }
              radius="lg"
              className="
                border
                border-white/10
                bg-white/4
                text-slate-300
                hover:bg-white/8
              "
            >
              Previous
            </Button>

            {/* Page Numbers */}

            <div className="flex items-center gap-1">

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(page - 3, 0),
                  Math.min(
                    page + 2,
                    totalPages
                  )
                )
                .map((pageNumber) => (

                  <Button
                    key={pageNumber}
                    onPress={() =>
                      handlePageChange(
                        pageNumber
                      )
                    }
                    isIconOnly
                    radius="lg"
                    className={
                      pageNumber === page
                        ? "bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-600/20"
                        : "bg-white/4 text-slate-400 hover:bg-white/8"
                    }
                  >
                    {pageNumber}
                  </Button>

                ))}

            </div>

            {/* Next */}

            <Button
              isDisabled={
                page === totalPages
              }
              onPress={() =>
                handlePageChange(
                  Math.min(
                    page + 1,
                    totalPages
                  )
                )
              }
              radius="lg"
              className="
                border
                border-white/10
                bg-white/4
                text-slate-300
                hover:bg-white/8
              "
            >
              Next
            </Button>

          </div>

        )}

    </div>
  );
};

export default EventsPage;