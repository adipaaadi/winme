import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { executives, filterCategories } from '../data/executives';
import { getBookedSlots } from '../lib/api';
import { nextFreeSlot } from '../lib/slots';
import ExecutiveCard from '../components/ExecutiveCard';
import usePageTitle from '../lib/usePageTitle';
import { CheckIcon, ChevronDownIcon, SearchIcon } from '../components/icons';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
];

function matchesSearch(exec, query) {
  if (!query) return true;
  const haystack = [
    exec.name,
    exec.title,
    exec.company,
    exec.bio,
    ...exec.topics,
    ...exec.goodQuestions,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function sortExecutives(list, sort) {
  const sorted = [...list];
  if (sort === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
  if (sort === 'rating') return sorted.sort((a, b) => b.rating - a.rating);
  return sorted.sort((a, b) => b.rating - a.rating || b.sessions - a.sessions);
}

export default function Browse() {
  usePageTitle('The network');

  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const initialTopic = topicParam && filterCategories.includes(topicParam) ? [topicParam] : [];

  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(initialTopic);
  const [sort, setSort] = useState('recommended');
  const [nextSlots, setNextSlots] = useState({});

  useEffect(() => {
    if (topicParam && filterCategories.includes(topicParam)) {
      setActiveFilters([topicParam]);
    }
  }, [topicParam]);

  useEffect(() => {
    let active = true;

    Promise.all(
      executives.map((exec) =>
        getBookedSlots(exec.id)
          .then((booked) => [exec.id, nextFreeSlot(exec, booked)])
          .catch(() => [exec.id, null]),
      ),
    ).then((entries) => {
      if (active) setNextSlots(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = executives.filter(
      (exec) =>
        matchesSearch(exec, normalizedQuery) &&
        activeFilters.every((filter) => exec.topics.includes(filter)),
    );
    return sortExecutives(filtered, sort);
  }, [query, activeFilters, sort]);

  function syncTopic(filters) {
    const next = new URLSearchParams(searchParams);
    if (filters.length === 1 && filterCategories.includes(filters[0])) {
      next.set('topic', filters[0]);
    } else {
      next.delete('topic');
    }
    setSearchParams(next, { replace: true });
  }

  function toggleFilter(filter) {
    const next = activeFilters.includes(filter)
      ? activeFilters.filter((item) => item !== filter)
      : [...activeFilters, filter];
    setActiveFilters(next);
    syncTopic(next);
  }

  function clearFilters() {
    setQuery('');
    setActiveFilters([]);
    syncTopic([]);
  }

  const hasFilters = query.trim() !== '' || activeFilters.length > 0;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl animate-fade-up">
        <p className="eyebrow">The network</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-5xl">
          Find someone who has been there
        </h1>
        <p className="mt-5 text-cream/65">
          Ten operators across engineering, product, AI, hiring and founding. Book a focused working
          session with any of them — advice only, no guaranteed outcomes.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside className="animate-fade-up lg:sticky lg:top-28 lg:self-start [animation-delay:80ms]">
          <div>
            <label htmlFor="executive-search" className="sr-only">
              Search operators
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/55" />
              <input
                id="executive-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, company or topic"
                className="field pl-10"
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/55">
              Filter by topic
            </h2>
            <div className="mt-3 border-t border-line">
              {filterCategories.map((filter) => {
                const active = activeFilters.includes(filter);
                const count = executives.filter((exec) => exec.topics.includes(filter)).length;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => toggleFilter(filter)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between gap-3 border-b border-line py-2.5 text-left text-sm transition-colors ${
                      active ? 'font-semibold text-cream' : 'text-cream/65 hover:text-cream'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                          active ? 'border-coral-500 bg-coral-500' : 'border-cream/25'
                        }`}
                      >
                        {active ? <CheckIcon className="h-3 w-3 text-navy" /> : null}
                      </span>
                      {filter}
                    </span>
                    <span className="text-xs tabular-nums text-cream/55">{count}</span>
                  </button>
                );
              })}
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-xs font-semibold text-cream underline decoration-coral-400 decoration-1 underline-offset-4 hover:decoration-2"
              >
                Clear search and filters
              </button>
            ) : null}
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-3 border-b border-cream/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-cream/65" aria-live="polite">
              <span className="font-semibold text-cream">{results.length}</span>{' '}
              {results.length === 1 ? 'operator' : 'operators'}
              {hasFilters ? ' match your filters' : ' in the network'}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs uppercase tracking-[0.12em] text-cream/55">
                Sort
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="appearance-none rounded-full border border-line bg-navy-900 py-2 pl-3 pr-9 text-sm font-medium text-cream transition focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/25"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/65" />
              </div>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {results.map((exec, index) => (
                <ExecutiveCard
                  key={exec.id}
                  exec={exec}
                  index={index + 1}
                  nextSlot={nextSlots[exec.id]}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 border-y border-line py-16 text-center">
              <SearchIcon className="mx-auto h-6 w-6 text-coral-400" />
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.01em]">
                No matches yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-cream/65">
                Try a broader search, or remove a filter or two. You can also clear everything and
                scan the topics.
              </p>
              <button type="button" onClick={clearFilters} className="btn-secondary mt-6">
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
