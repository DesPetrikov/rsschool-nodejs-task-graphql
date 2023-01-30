import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await this.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await this.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!post) {
        throw this.httpErrors.notFound(`Post with id - ${request.params.id} not found`)
      }
      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return await this.db.posts.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const deletedPost = await this.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!deletedPost) {
        reply.statusCode = 400;
        throw new Error('Invalid id');
      }
      await this.db.posts.delete(request.params.id);
      return deletedPost;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await this.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!post) {
        reply.statusCode = 400;
        throw new Error('Invalid id');
      }
      return await this.db.posts.change(request.params.id, request.body);
    }
  );
};

export default plugin;
