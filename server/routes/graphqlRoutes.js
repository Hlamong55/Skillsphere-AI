
/*
===========================================
SkillSphere AI - GraphQL Routes
===========================================

Features:
1. GraphQL HTTP Endpoint
2. Existing JWT Authentication
3. Community GraphQL Schema
4. MongoDB GraphQL Resolvers
5. Protected GraphQL Queries

Endpoint:
POST /graphql

===========================================
*/


const express = require("express");

const { createHandler } = require(
  "graphql-http/lib/use/express"
);


const { protect } = require(
  "../middleware/authMiddleware"
);


const { communitySchema } = require(
  "../graphql/communitySchema"
);


const { communityRoot } = require(
  "../graphql/communityResolvers"
);


const router = express.Router();

router.use(protect);



const graphqlHandler = createHandler({

  // GraphQL Schema
  schema: communitySchema,

  // Root Query Resolvers
  rootValue: communityRoot,

  context: (req) => {
    return {
      user: req.raw?.user ?? null,
    };
  },

});


router.all("/", graphqlHandler);


module.exports = router;
