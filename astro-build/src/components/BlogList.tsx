import { useMemo, useState } from "react";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  featureImage?: string;
}

interface BlogListProps {
  posts: Post[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const { postCounts, categories } = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.category) counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return {
      postCounts: counts,
      categories: Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([category]) => category),
    };
  }, [posts]);

  const normalizedQuery = searchQuery.trim();
  const filteredPosts = useMemo(() => {
    const query = normalizedQuery.toLowerCase();
    return posts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false;
      if (selectedTag && !post.tags?.includes(selectedTag)) return false;
      if (!query) return true;
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [posts, normalizedQuery, selectedCategory, selectedTag]);

  const filtersActive = Boolean(normalizedQuery || selectedCategory || selectedTag);
  const featuredPosts = filtersActive ? [] : filteredPosts.filter((post) => post.featured).slice(0, 2);
  const regularPosts = filteredPosts.filter((post) => !featuredPosts.includes(post));
  const visiblePosts = regularPosts.slice(0, visibleCount);
  const hasMore = visibleCount < regularPosts.length;
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery("");
  };

  const PostRow = ({ post, featured = false }: { post: Post; featured?: boolean }) => (
    <article className={`publication-list-row${featured ? " publication-list-row--featured" : ""}`}>
      <div className="publication-list-row__body">
        <div className="publication-list-row__meta">
          {post.category && <span>{post.category}</span>}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
        <h3>
          <a href={`/blog/${post.id}`}>{post.title}</a>
        </h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="publication-list-row__tags" aria-label={`Topics for ${post.title}`}>
            {post.tags.slice(0, 4).map((tag) => (
              <button key={tag} type="button" onClick={() => setSelectedTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      {post.featureImage && (
        <a className="publication-list-row__image" href={`/blog/${post.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={post.featureImage}
            alt=""
            width={560}
            height={315}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
          />
        </a>
      )}
    </article>
  );

  return (
    <div className="publication-list">
      <section className="publication-filter" aria-label="Filter essays">
        <label htmlFor="essay-search">Search these essays</label>
        <div className="publication-filter__search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="essay-search"
            type="search"
            placeholder="Title, excerpt, or topic"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="publication-filter__categories" aria-label="Essay subjects">
          <button
            type="button"
            aria-pressed={!selectedCategory}
            onClick={() => setSelectedCategory(null)}
          >
            All <span>{posts.length}</span>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category} <span>{postCounts[category]}</span>
            </button>
          ))}
          <a href="/blog/tags">Browse topics</a>
        </div>
      </section>

      {filtersActive && (
        <div className="publication-filter__status" aria-live="polite">
          <p>
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "essay" : "essays"}
            {selectedCategory && <> in <strong>{selectedCategory}</strong></>}
            {selectedTag && <> tagged <strong>{selectedTag}</strong></>}
            {normalizedQuery && <> matching <strong>“{normalizedQuery}”</strong></>}
          </p>
          <button type="button" onClick={resetFilters}>Clear filters</button>
        </div>
      )}

      {featuredPosts.length > 0 && !filtersActive && (
        <section className="publication-list__section" aria-labelledby="featured-essays">
          <div className="publication-list__heading">
            <h2 id="featured-essays">Featured</h2>
          </div>
          <div className="publication-list__rows">
            {featuredPosts.map((post) => <PostRow key={post.id} post={post} featured />)}
          </div>
        </section>
      )}

      {visiblePosts.length > 0 && (
        <section className="publication-list__section" aria-labelledby="essay-results">
          <div className="publication-list__heading">
            <h2 id="essay-results">{filtersActive ? "Results" : "Latest"}</h2>
            <span>{visiblePosts.length} of {regularPosts.length}</span>
          </div>
          <div className="publication-list__rows">
            {visiblePosts.map((post) => <PostRow key={post.id} post={post} />)}
          </div>
          {hasMore && (
            <div className="publication-list__more">
              <button type="button" onClick={() => setVisibleCount((count) => count + 12)}>
                Load more <span>({regularPosts.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </section>
      )}

      {filteredPosts.length === 0 && (
        <div className="publication-list__empty">
          <p>No essays match these filters.</p>
          {normalizedQuery && <a href={`/search?q=${encodeURIComponent(normalizedQuery)}`}>Search the whole site instead</a>}
          <button type="button" onClick={resetFilters}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
