import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql/graphql';
import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql/type';
import { graphqlBodySchema } from './schema';
import { MemberTypeType, PostType, ProfileType, UserType } from './types';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const rootQuery = new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          users: {
            type: new GraphQLList(UserType),
            resolve: async () => {
              return await this.db.users.findMany();
            },
          },
          posts: {
            type: new GraphQLList(PostType),
            resolve: async () => {
              return await this.db.posts.findMany();
            },
          },
          memberTypes: {
            type: new GraphQLList(MemberTypeType),
            resolve: async () => {
              return await this.db.memberTypes.findMany();
            },
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => {
              return await this.db.profiles.findMany();
            },
          }
        },
      });
      const schema = new GraphQLSchema({
        query: rootQuery,
      });

      return await graphql({
        schema,
        source: request.body.query!,
      });
    }
  );
};

export default plugin;
