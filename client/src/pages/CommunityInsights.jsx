
import { useEffect, useState } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiDatabase,
  FiFileText,
  FiRefreshCw,
  FiUsers,
  FiClock,
  FiLayers,
} from "react-icons/fi";


// ==========================================
// GRAPHQL CONFIGURATION

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ||
  "http://localhost:5001/graphql";


// ==========================================
// GRAPHQL QUERY
// ==========================================

const COMMUNITY_QUERY = `
  query GetCommunityInsights {
    apiStatus

    communityOverview {
      totalUsers
      totalPosts

      recentPosts {
        id
        content
        createdAt

        author {
          id
          username
        }
      }
    }
  }
`;

// ==========================================
// GET JWT TOKEN
// ==========================================


function getAuthToken() {
  try {
    const userInfo = JSON.parse(
      localStorage.getItem("userInfo") || "null"
    );

    return (
      userInfo?.token ||
      localStorage.getItem("token") ||
      null
    );
  } catch {
    return localStorage.getItem("token") || null;
  }
}


// ==========================================
// FETCH GRAPHQL DATA
// ==========================================

async function fetchCommunityInsights(
  signal
) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Please login to view Community Insights."
    );
  }

  const response = await fetch(
    GRAPHQL_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        query: COMMUNITY_QUERY,
      }),

      signal,
    }
  );

  // Handle invalid/expired JWT.
  if (response.status === 401) {
    throw new Error(
      "Your login session has expired. Please login again."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}).`
    );
  }

  // GraphQL can return errors even
  // when the HTTP status is 200.
  if (result.errors?.length) {
    throw new Error(
      result.errors
        .map((error) => error.message)
        .join("; ")
    );
  }

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed (HTTP ${response.status}).`
    );
  }

  const overview =
    result.data?.communityOverview;

  if (!overview) {
    throw new Error(
      "Community Overview data was not returned."
    );
  }

  return {
    apiStatus:
      result.data.apiStatus,

    totalUsers:
      overview.totalUsers,

    totalPosts:
      overview.totalPosts,

    recentPosts:
      Array.isArray(
        overview.recentPosts
      )
        ? overview.recentPosts
        : [],
  };
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatPostDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

// ==========================================
// REUSABLE STAT CARD
// ==========================================

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#151B2B] p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-gray-400">
          {title}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">

          <Icon size={20} />

        </div>

      </div>

      <p className="mt-4 text-3xl font-extrabold text-white">

        {value}

      </p>

      <p className="mt-2 text-xs text-gray-500">

        {description}

      </p>

    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CommunityInsights() {

  const [dashboard, setDashboard] =
    useState({
      status: "loading",
      data: null,
      error: "",
    });

  const [refreshCount, setRefreshCount] =
    useState(0);


  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    fetchCommunityInsights(
      controller.signal
    )
      .then((data) => {
        if (!active) {
          return;
        }

        setDashboard({
          status: "success",
          data,
          error: "",
        });
      })
      .catch((error) => {
        if (
          !active ||
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Community Insights GraphQL Error:",
          error
        );

        setDashboard({
          status: "error",
          data: null,
          error:
            error.message ||
            "Unable to load community data.",
        });
      });

    return () => {
      active = false;

      controller.abort();
    };
  }, [refreshCount]);


  const handleRefresh = () => {
    setDashboard((previous) => ({
      ...previous,

      status: "loading",
      error: "",
    }));

    setRefreshCount(
      (count) => count + 1
    );
  };


  const loading =
    dashboard.status === "loading";

  const connected =
    dashboard.status === "success";

  const data = dashboard.data;

  const recentPosts =
    data?.recentPosts || [];

  // ========================================
  // PAGE UI
  // ========================================

  return (
    <main className="min-h-screen bg-[#0B1120] px-4 py-8 text-white sm:px-6 lg:py-10">

      <div className="mx-auto max-w-6xl">


        {/* ==================================
            HEADER
        ================================== */}

        <header className="mb-8 mt-6 flex flex-wrap items-start justify-between gap-5">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">

              SkillSphere AI · Community Analytics

            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">

              Community Insights

            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">

              Explore our learning community
              through live MongoDB data,
              delivered using GraphQL.

            </p>

          </div>

          {/* GRAPHQL STATUS */}

          <div
            role="status"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
              connected
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : loading
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >

            {connected ? (

              <FiCheckCircle />

            ) : loading ? (

              <FiRefreshCw className="animate-spin" />

            ) : (

              <FiAlertCircle />

            )}

            GraphQL ·{" "}

            {connected
              ? "Connected"
              : loading
                ? "Loading"
                : "Error"}

          </div>

        </header>

        {/* ==================================
            GRAPHQL INFO BAR
        ================================== */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">

              <FiDatabase size={21} />

            </div>

            <div>

              <p className="font-semibold text-indigo-100">

                Powered by GraphQL

              </p>

              <p className="mt-1 text-xs text-indigo-200/70">

                Secure JWT queries · MongoDB ·
                Express Backend

              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh Data"}

          </button>

        </div>

        {/* ==================================
            ERROR MESSAGE
        ================================== */}

        {dashboard.status === "error" && (

          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-5"
          >

            <div className="flex items-start gap-3">

              <FiAlertCircle className="mt-1 shrink-0 text-red-400" />

              <div>

                <p className="font-semibold text-red-300">

                  Unable to load Community Insights

                </p>

                <p className="mt-2 text-sm text-red-200/80">

                  {dashboard.error}

                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-4 rounded-lg border border-red-400/30 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/10"
                >

                  Try Again

                </button>

              </div>

            </div>

          </div>

        )}

        {/* ==================================
            COMMUNITY STATISTICS
        ================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={FiUsers}
            title="Total Users"
            value={
              data?.totalUsers
                ?.toLocaleString() ?? "—"
            }
            description="Registered community members"
          />

          <StatCard
            icon={FiFileText}
            title="Total Posts"
            value={
              data?.totalPosts
                ?.toLocaleString() ?? "—"
            }
            description="Posts stored in MongoDB"
          />

          <StatCard
            icon={FiLayers}
            title="Recent Posts"
            value={
              connected
                ? recentPosts.length
                : "—"
            }
            description="Latest posts returned by GraphQL"
          />

          <StatCard
            icon={FiActivity}
            title="API Connection"
            value={
              connected
                ? "Active"
                : loading
                  ? "Loading"
                  : "Offline"
            }
            description="Authenticated GraphQL API"
          />

        </div>

        {/* ==================================
            RECENT COMMUNITY POSTS
        ================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#151B2B]">

          {/* SECTION HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-6">

            <div>

              <h2 className="text-xl font-bold">

                Recent Community Posts

              </h2>

              <p className="mt-1 text-xs text-gray-400">

                Latest five posts fetched
                directly through GraphQL.

              </p>

            </div>

            <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">

              GraphQL Query

            </span>

          </div>

          {/* LOADING STATE */}

          {loading && (

            <div
              role="status"
              className="space-y-4 p-6"
            >

              {[1, 2, 3].map(
                (item) => (

                  <div
                    key={item}
                    className="animate-pulse rounded-xl border border-white/5 bg-white/5 p-5"
                  >

                    <div className="h-4 w-1/3 rounded bg-white/10" />

                    <div className="mt-4 h-3 w-full rounded bg-white/10" />

                    <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />

                  </div>

                )
              )}

              <p className="text-center text-xs text-gray-500">

                Loading community data...

              </p>

            </div>

          )}

          {/* EMPTY STATE */}

          {connected &&
            recentPosts.length === 0 && (

              <div className="px-6 py-14 text-center">

                <FiFileText
                  size={30}
                  className="mx-auto text-gray-500"
                />

                <h3 className="mt-4 font-semibold">

                  No Community Posts Yet

                </h3>

                <p className="mt-2 text-sm text-gray-400">

                  New community posts will
                  appear here after refreshing.

                </p>

              </div>

            )}

          {/* LIVE POSTS */}

          {connected &&
            recentPosts.length > 0 && (

              <div className="divide-y divide-white/10">

                {recentPosts.map(
                  (post, index) => (

                    <article
                      key={post.id}
                      className="p-5 transition-colors hover:bg-white/5 sm:p-6"
                    >

                      {/* POST AUTHOR */}

                      <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-base font-bold text-indigo-200">

                          {post.author
                            ?.username
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="font-semibold text-white">

                              {post.author
                                ?.username ||
                                "Unknown User"}

                            </p>

                            {index === 0 && (

                              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">

                                Latest

                              </span>

                            )}

                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">

                            <FiClock size={12} />

                            {formatPostDate(
                              post.createdAt
                            )}

                          </p>

                        </div>

                      </div>

                      {/* POST CONTENT */}

                      <p className="mt-4 whitespace-pre-wrap wrap-break-words text-sm leading-7 text-gray-300">

                        {post.content?.trim() ||
                          "Media post without text content."}

                      </p>

                    </article>

                  )
                )}

              </div>

            )}

        </section>

        {/* ==================================
            FOOTER
        ================================== */}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs leading-6 text-gray-500">

          <p>

            Powered by GraphQL ·
            MongoDB · JWT Authentication

          </p>

          <p>

            Data updates when the dashboard
            loads or you click Refresh.

          </p>

        </footer>

      </div>

    </main>
  );
}
