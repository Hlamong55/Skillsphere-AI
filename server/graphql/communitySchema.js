
/*
===========================================
SkillSphere AI - GraphQL Community Schema
===========================================

Features:
- GraphQL API status
- Total community users
- Total community posts
- Recent community posts
- Post author details

===========================================
*/

const { buildSchema } = require("graphql");

// =========================================
// GRAPHQL SCHEMA
// =========================================

const communitySchema = buildSchema(`

  # ---------------------------------------
  # COMMUNITY USER TYPE
  # ---------------------------------------

  type CommunityUser {
    id: ID!
    username: String!
  }

  # ---------------------------------------
  # COMMUNITY POST TYPE
  # ---------------------------------------

  type CommunityPost {
    id: ID!
    content: String!
    createdAt: String
    author: CommunityUser
  }

  # ---------------------------------------
  # COMMUNITY OVERVIEW TYPE
  # ---------------------------------------

  type CommunityOverview {
    totalUsers: Int!
    totalPosts: Int!
    recentPosts: [CommunityPost!]!
  }

  # ---------------------------------------
  # ROOT QUERY
  # ---------------------------------------

  type Query {

    # GraphQL API health check
    apiStatus: String!

    # Community statistics from MongoDB
    communityOverview: CommunityOverview!

  }

`);


module.exports = {
  communitySchema,
};
