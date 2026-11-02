
/*
==========================================
SkillSphere AI - GraphQL Resolvers
==========================================

Features:
1. GraphQL API Status
2. Total Registered Users
3. Total Community Posts
4. Five Most Recent Posts
5. Post Author Information
6. JWT Authentication Check

Database:
Existing MongoDB User and Post Models

Existing REST APIs remain unchanged.
==========================================
*/

const { GraphQLError } = require("graphql");

const User = require("../models/User");
const Post = require("../models/Post");

// ========================================
// CONFIGURATION
// ========================================

const RECENT_POST_LIMIT = 5;

// ========================================
// GET POST AUTHOR REFERENCE
// ========================================

// Supports common author field names.
// Handles ObjectId or populated objects.

function getAuthorReference(post) {
  return (
    post.user ??
    post.author ??
    post.createdBy ??
    post.userId ??
    null
  );
}

// ========================================
// CONVERT MONGODB ID TO STRING
// ========================================

function getId(value) {
  if (!value) {
    return null;
  }

  const rawId =
    typeof value === "object" && value._id
      ? value._id
      : value;

  return String(rawId);
}

// ========================================
// FORMAT POST DATE
// ========================================

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

// ========================================
// GET POST CONTENT
// ========================================

// Supports text-based and image-only posts.

function getPostContent(post) {
  const possibleValues = [
    post.content,
    post.text,
    post.caption,
    post.description,
  ];

  const content = possibleValues.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return content || "";
}

// ========================================
// GRAPHQL ROOT RESOLVERS
// ========================================

const communityRoot = {

  // ======================================
  // QUERY 1: GRAPHQL API STATUS
  // ======================================

  apiStatus: () => {
    return "SkillSphere AI GraphQL API is running";
  },

  // ======================================
  // QUERY 2: COMMUNITY OVERVIEW
  // ======================================

  communityOverview: async (_args, context) => {

    // ------------------------------------
    // AUTHENTICATION CHECK
    // ------------------------------------

    // The GraphQL Router passes req.user
    // through the GraphQL context.
    //
    // The existing JWT protect middleware
    // verifies the logged-in user.

    if (!context?.user) {
      throw new GraphQLError(
        "Authentication required",
        {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        }
      );
    }

    try {

      // ==================================
      // FETCH COMMUNITY DATA
      // ==================================

      const [
        totalUsers,
        totalPosts,
        recentPosts,
      ] = await Promise.all([

        // Count registered users.
        User.countDocuments({}),

        // Count community posts.
        Post.countDocuments({}),

        // Get latest 5 posts.
        Post.find({})
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .limit(RECENT_POST_LIMIT)
          .lean(),

      ]);

      // ==================================
      // COLLECT POST AUTHOR IDS
      // ==================================

      const authorIds = recentPosts
        .map(getAuthorReference)
        .map(getId)
        .filter(
          (id) =>
            id !== null &&
            /^[0-9a-fA-F]{24}$/.test(id)
        );

      // Remove duplicate author IDs.
      const uniqueAuthorIds = [
        ...new Set(authorIds),
      ];

      // ==================================
      // FETCH AUTHOR DETAILS
      // ==================================

      const authors =
        uniqueAuthorIds.length > 0
          ? await User.find({
              _id: {
                $in: uniqueAuthorIds,
              },
            })
              .select("_id username")
              .lean()
          : [];

      // ==================================
      // CREATE AUTHOR LOOKUP MAP
      // ==================================

      const authorMap = new Map();

      authors.forEach((author) => {
        authorMap.set(
          String(author._id),
          author
        );
      });

      // ==================================
      // FORMAT RECENT POSTS
      // ==================================

      const formattedPosts = recentPosts.map(
        (post) => {

          const authorReference =
            getAuthorReference(post);

          const authorId =
            getId(authorReference);

          const author = authorId
            ? authorMap.get(authorId)
            : null;

          const formattedAuthor =
            author?.username
              ? {
                  id: String(author._id),
                  username: author.username,
                }
              : null;

          return {
            id: String(post._id),

            content: getPostContent(post),

            createdAt: formatDate(
              post.createdAt
            ),

            author: formattedAuthor,
          };
        }
      );

      // ==================================
      // RETURN GRAPHQL RESPONSE
      // ==================================

      return {
        totalUsers,
        totalPosts,
        recentPosts: formattedPosts,
      };

    } catch (error) {

      console.error(
        "GraphQL Community Overview Error:",
        error
      );

      throw new GraphQLError(
        "Unable to load community overview",
        {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        }
      );

    }
  },
};


module.exports = {
  communityRoot,
};
