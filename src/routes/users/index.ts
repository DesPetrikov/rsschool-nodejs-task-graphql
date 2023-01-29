import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await this.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const result = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!result) {
        reply.statusCode = 404;
        throw new Error('Invalid id');
      }
      return result;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await this.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const deletedUser = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!deletedUser) {
        reply.statusCode = 400;
        throw new Error('Invalid id');
      }
      const subscriptions = await this.db.users.findMany({ key: 'subscribedToUserIds', inArray: request.params.id });
      for(let i = 0; i< subscriptions.length; i++) {
        await this.db.users.change(subscriptions[i].id, {subscribedToUserIds: subscriptions[i].subscribedToUserIds.filter(id => id !== request.params.id)})
      }
      const userPosts = await this.db.posts.findMany({key: 'userId', equals: request.params.id})
      for(let i = 0; i < userPosts.length; i++) {
        await this.db.posts.delete(userPosts[i].id)
      }
      await this.db.users.delete(request.params.id);
      return deletedUser;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscriber = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });
      const subscriptionKeeper = await this.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });
      if (!subscriber) {
        reply.statusCode = 400;
        throw new Error('Invalid subscriber id');
      }
      if (!subscriptionKeeper) {
        reply.statusCode = 400;
        throw new Error('Invalid subscriptionKeeper id');
      }
      return await this.db.users.change(subscriptionKeeper.id, {
        subscribedToUserIds: [
          ...subscriptionKeeper.subscribedToUserIds,
          subscriber.id,
        ],
      });
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscriber = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });
      const subscriptionKeeper = await this.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });
      if (!subscriber) {
        reply.statusCode = 400;
        throw new Error('Invalid subscriber id');
      }
      if (!subscriptionKeeper) {
        reply.statusCode = 400;
        throw new Error('Invalid subscriptionKeeper id');
      }
      const subscriberIdx = subscriptionKeeper.subscribedToUserIds.findIndex(
        (subId) => subId === subscriber.id
      );
      if (subscriberIdx !== -1) {
        return await this.db.users.change(subscriptionKeeper.id, {
          subscribedToUserIds: subscriptionKeeper.subscribedToUserIds.filter(id => id !== request.params.id)
        });
      } else {
        reply.statusCode = 400;
        throw new Error('Following user not found');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!user) {
        reply.statusCode = 400;
        throw new Error('Invalid id');
      }
      return await this.db.users.change(request.params.id, request.body);
    }
  );
};

export default plugin;
