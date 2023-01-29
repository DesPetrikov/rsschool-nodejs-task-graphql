// import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
// import { idParamSchema } from '../../utils/reusedSchemas';
// import { createProfileBodySchema, changeProfileBodySchema } from './schema';
// import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

// const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
//   fastify
// ): Promise<void> => {
//   fastify.get('/', async function (request, reply): Promise<
//     ProfileEntity[]
//   > {
//     return await this.db.profiles.findMany()
//   });

//   fastify.get(
//     '/:id',
//     {
//       schema: {
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {
//       const result = await this.db.profiles.findOne({
//         key: 'id',
//         equals: request.params.id,
//       });
//       if (!result) {
//         reply.statusCode = 404;
//         throw new Error('Invalid id');
//       }
//       return result;
//     }
//   );

//   fastify.post(
//     '/',
//     {
//       schema: {
//         body: createProfileBodySchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {
//       return await this.db.profiles.create(request.body)
//     }
//   );

//   fastify.delete(
//     '/:id',
//     {
//       schema: {
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {
//       const deletedProfile = await this.db.profiles.findOne({
//         key: 'id',
//         equals: request.params.id,
//       });
//       if (!deletedProfile) {
//         reply.statusCode = 400;
//         throw new Error('Invalid id');
//       }
//       await this.db.profiles.delete(request.params.id);
//       return deletedProfile;
//     }
//   );

//   fastify.patch(
//     '/:id',
//     {
//       schema: {
//         body: changeProfileBodySchema,
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {
//       const profile = await this.db.users.findOne({
//         key: 'id',
//         equals: request.params.id,
//       });
//       if (!profile) {
//         reply.statusCode = 400;
//         throw new Error('Invalid id');
//       }
//       return await this.db.profiles.change(request.params.id, request.body);
//     }
//   );
// };

// export default plugin;
