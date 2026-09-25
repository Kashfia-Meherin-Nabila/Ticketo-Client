"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  ListBox,
  Select,
} from "@heroui/react";
import toast from "react-hot-toast";
import { BiSearch } from "react-icons/bi";
import {
  FiRotateCcw,
  FiSliders,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";

import DashboardHeading from "@/components/DashboardHeading";
import EventCard from "@/components/EventCard";

import {
  eventFilters,
  publicEvents,
} from "@/lib/api/events/data";

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);

  const limit = 8;

  // ==========================================
  // LOAD FILTERS
  // ==========================================

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setFilterLoading(true);

        const data = await eventFilters();

        setCategories(
          Array.isArray(data?.categories)
            ? data.categories
            : []
        );

        setLocations(
          Array.isArray(data?.locations)
            ? data.locations
            : []
        );
      } catch (error) {
        console.error("Filter error:", error);

        toast.error(
          error?.message || "Failed to load filters"
        );

        setCategories([]);
        setLocations([]);
      } finally {
        setFilterLoading(false);
      }
    };

    loadFilters();
  }, []);

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
          category,
          location,
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
  }, [
    page,
    search,
    category,
    location,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  // ==========================================
  // RESET
  // ==========================================

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setLocation("");
    setPage(1);
  };

  // ==========================================
  // CATEGORY
  // ==========================================

  const handleCategoryChange = (keys) => {
    const selectedKey = Array.from(keys)[0];

    const value =
      selectedKey !== undefined
        ? String(selectedKey)
        : "";

    setCategory(value);
    setPage(1);
  };

  // ==========================================
  // LOCATION
  // ==========================================

  const handleLocationChange = (keys) => {
    const selectedKey = Array.from(keys)[0];

    const value =
      selectedKey !== undefined
        ? String(selectedKey)
        : "";

    setLocation(value);
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
          HERO / HEADING
      ====================================== */}

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-indigo-950/80 via-slate-950 to-violet-950/50 px-6 py-12 md:px-10 md:py-16">

        {/* Decorative glow */}

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
            <FiCalendar size={15} />
            Discover something amazing
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Find Your Next
            <span className="block bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Unforgettable Event
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            Explore concerts, workshops, conferences and
            experiences happening around you.
          </p>

        </div>

        {/* Stats */}

        <div className="relative z-10 mt-10 flex flex-wrap gap-3">

          <div className="rounded-xl border border-white/10 bg-white/4 px-5 py-3 backdrop-blur-md">
            <p className="text-2xl font-bold text-white">
              {total}
            </p>
            <p className="text-xs text-slate-500">
              Available Events
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/4 px-5 py-3 backdrop-blur-md">
            <p className="text-2xl font-bold text-white">
              {categories.length}
            </p>
            <p className="text-xs text-slate-500">
              Categories
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/4 px-5 py-3 backdrop-blur-md">
            <p className="text-2xl font-bold text-white">
              {locations.length}
            </p>
            <p className="text-xs text-slate-500">
              Locations
            </p>
          </div>

        </div>
      </section>

      {/* ======================================
          FILTER SECTION
      ====================================== */}

      <Card
        className="
          mt-8
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-slate-950/70
          shadow-2xl
          shadow-black/20
        "
      >

        <div className="border-b border-white/10 px-5 py-4 md:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FiSliders size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Find an Event
              </h2>

              <p className="text-xs text-slate-500">
                Search and filter upcoming events
              </p>
            </div>

          </div>

        </div>

        <form
          onSubmit={handleSearch}
          className="
            grid
            grid-cols-1
            gap-4
            p-5
            md:grid-cols-2
            md:p-6
            lg:grid-cols-4
          "
        >

          {/* SEARCH */}

          <div>

            <label
              htmlFor="search"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Search
            </label>

            <div className="relative">

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
                className="w-full pl-10"
              />

            </div>

          </div>

          {/* CATEGORY */}

          <div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </label>

            <Select
              aria-label="Category"
              placeholder={
                filterLoading
                  ? "Loading..."
                  : "All categories"
              }
              selectedKeys={
                category
                  ? new Set([category])
                  : new Set()
              }
              onSelectionChange={
                handleCategoryChange
              }
              isDisabled={filterLoading}
            >

              <ListBox>

                {categories.length > 0 ? (
                  categories.map((item) => (
                    <ListBox.Item
                      key={item}
                      id={item}
                      textValue={item}
                    >
                      {item}
                    </ListBox.Item>
                  ))
                ) : (
                  <ListBox.Item
                    id="no-category"
                    textValue="No categories available"
                    isDisabled
                  >
                    No categories available
                  </ListBox.Item>
                )}

              </ListBox>

            </Select>

          </div>

          {/* LOCATION */}

          <div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Location
            </label>

            <Select
              aria-label="Location"
              placeholder={
                filterLoading
                  ? "Loading..."
                  : "All locations"
              }
              selectedKeys={
                location
                  ? new Set([location])
                  : new Set()
              }
              onSelectionChange={
                handleLocationChange
              }
              isDisabled={filterLoading}
            >

              <ListBox>

                {locations.length > 0 ? (
                  locations.map((item) => (
                    <ListBox.Item
                      key={item}
                      id={item}
                      textValue={item}
                    >
                      {item}
                    </ListBox.Item>
                  ))
                ) : (
                  <ListBox.Item
                    id="no-location"
                    textValue="No locations available"
                    isDisabled
                  >
                    No locations available
                  </ListBox.Item>
                )}

              </ListBox>

            </Select>

          </div>

          {/* ACTIONS */}

          <div className="flex items-end gap-2">

            <Button
              type="submit"
              radius="lg"
              className="
                h-10
                flex-1
                bg-indigo-600
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:bg-indigo-500
              "
            >
              <BiSearch size={18} />
              Search Events
            </Button>

            <Button
              type="button"
              isIconOnly
              radius="lg"
              aria-label="Reset filters"
              onPress={handleReset}
              className="
                h-10
                w-10
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

          </div>

        </form>
      </Card>

      {/* ======================================
          RESULTS HEADER
      ====================================== */}

      <div className="mt-12 mb-6 flex items-end justify-between">

        <div>

          <div className="flex items-center gap-3">

            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
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

      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

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

                  <div className="h-4 w-20 animate-pulse rounded   bg-white/6" />

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
           EMPTY
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
              current search or filters.
            </p>

            <Button
              onPress={handleReset}
              radius="lg"
              className="mt-6 bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-500"
            >
              Clear All Filters
            </Button>

          </div>

        </Card>

      ) : (

        /* ====================================
           EVENTS
        ==================================== */

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

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

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">

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