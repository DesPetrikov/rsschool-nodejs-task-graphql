import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql/graphql';
import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql/type';
import { GraphQLID } from 'graphql/type/scalars';
import { graphqlBodySchema } from './schema';
import {
  AllInformationAboutUserType,
  MemberTypeType,
  PostType,
  ProfileType,
  UserType,
} from './types';

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
              this.log.warn(request.body.query);
              return await this.db.users.findMany();
            },
          },
          user: {
            type: UserType,
            args: {
              userId: {
                type: GraphQLID,
              },
            },
            resolve: async (parent, args) => {
              const user = await this.db.users.findOne({
                key: 'id',
                equals: args.userId,
              });
              if (!user) {
                throw this.httpErrors.notFound(
                  `User with id - ${args.userId} was not found`
                );
              }
              return user;
            },
          },
          posts: {
            type: new GraphQLList(PostType),
            resolve: async () => {
              return await this.db.posts.findMany();
            },
          },
          post: {
            type: PostType,
            args: {
              postId: {
                type: GraphQLID,
              },
            },
            resolve: async (parent, args) => {
              const post = await this.db.posts.findOne({
                key: 'id',
                equals: args.postId,
              });
              if (!post) {
                throw this.httpErrors.notFound(
                  `Post with id - ${args.postId} was not found`
                );
              }
              return post;
            },
          },

          memberTypes: {
            type: new GraphQLList(MemberTypeType),
            resolve: async () => {
              return await this.db.memberTypes.findMany();
            },
          },
          memberType: {
            type: MemberTypeType,
            args: {
              memberTypeId: {
                type: GraphQLID,
              },
            },
            resolve: async (parent, args) => {
              const type = await this.db.memberTypes.findOne({
                key: 'id',
                equals: args.memberTypeId,
              });
              if (!type) {
                throw this.httpErrors.notFound(
                  `Member Type with id - ${args.memberTypeId} was not found`
                );
              }
              return type;
            },
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => {
              return await this.db.profiles.findMany();
            },
          },
          profile: {
            type: ProfileType,
            args: {
              profileId: {
                type: GraphQLID,
              },
            },
            resolve: async (parent, args) => {
              const profile = await this.db.profiles.findOne({
                key: 'id',
                equals: args.profileId,
              });
              if (!profile) {
                throw this.httpErrors.notFound(
                  `Profile with id - ${args.profileId} not found`
                );
              }
              return profile;
            },
          },
          allInformationAboutUsers: {
            type: new GraphQLList(AllInformationAboutUserType),
            resolve: async () => {
              const users = await this.db.users.findMany();
              const allUsersData = [];
              for (let i = 0; i < users.length; i++) {
                const posts = await this.db.posts.findMany({
                  key: 'userId',
                  equals: users[i].id,
                });
                const profile = await this.db.profiles.findOne({
                  key: 'userId',
                  equals: users[i].id,
                });
                const memberType = profile
                  ? await this.db.memberTypes.findOne({
                      key: 'id',
                      equals: profile.memberTypeId,
                    })
                  : null;
                allUsersData.push({
                  user: users[i],
                  profile,
                  memberType,
                  posts,
                });
              }
              return allUsersData;
            },
          },
        },
      });
      const schema = new GraphQLSchema({
        query: rootQuery,
      });

      return await graphql({
        schema,
        source: request.body.query!,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
