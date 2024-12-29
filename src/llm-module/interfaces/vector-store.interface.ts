import {
  PrismaSqlFilter,
  PrismaVectorStore,
} from '@langchain/community/vectorstores/prisma';

export type SyllabusVectorStoreType = PrismaVectorStore<
  Record<string, unknown>,
  'syllabus',
  { id: true; content: true },
  PrismaSqlFilter<Record<string, unknown>>
>;
