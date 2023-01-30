import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await this.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const type = await this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!type) {
        throw this.httpErrors.notFound(
          `Member Type with id - ${request.params.id} was not found`
        );
      }
      return type;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberType = await this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!memberType) {
        throw this.httpErrors.badRequest('Invalid id');
      }
      return await this.db.memberTypes.change(request.params.id, request.body);
    }
  );
};

export default plugin;
