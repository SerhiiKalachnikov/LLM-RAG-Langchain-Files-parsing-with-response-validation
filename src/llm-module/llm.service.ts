import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Retry } from '../decorators/retry';
import {
  ChatOpenAI,
  Document,
  DocxLoader,
  Ollama,
  OllamaEmbeddings,
  OpenAIEmbeddings,
  PDFLoader,
  PromptTemplate,
  RecursiveCharacterTextSplitter,
  RunnableSequence,
  StructuredOutputParser,
  TextLoader,
} from '../utils/langchain.imports';
import { StoreToFile } from '../utils/log-to-file';
import {
  allowedMimeTypes,
  EMimeType,
  IFinalCalendarParts,
  ISummaryAndCalendar,
  SyllabusVectorStoreType,
} from './interfaces';
import { summaryAndCalendarSchema } from './validators';

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  private readonly storeToFile = new StoreToFile(LlmService.name);

  private readonly embeddings: OpenAIEmbeddings | OllamaEmbeddings;
  private readonly vision: Ollama | ChatOpenAI;
  private readonly chat: Ollama | ChatOpenAI;

  private vectorStore: SyllabusVectorStoreType; // development time

  constructor() {
    this.logger.log('🚀 Initializing LlmService...');
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('🔒 Using OpenAI embeddings and vision for production.');
      this.embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_EMBEDDING_MODEL,
      });
      this.vision = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_VISION_MODEL,
      });
      this.chat = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_CHAT_MODEL,
      });
    } else {
      this.logger.log('🔧 Using Ollama embeddings and vision for development.');
      this.embeddings = new OllamaEmbeddings({
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_EMBEDDING_MODEL,
      });
      this.vision = new Ollama({
        baseUrl: process.env.OLLAMA_API_URL,
        model: process.env.OLLAMA_VISION_MODEL,
      });
      this.chat = new Ollama({
        baseUrl: process.env.OLLAMA_API_URL,
        model: process.env.OLLAMA_CHAT_MODEL,
      });
    }
  }

  async onModuleInit() {
    // await this.vectorInit();
  }

  async vectorInit() {
    // this.logger.log('🗄️ Initializing vector store...');
    // const vectorStore = PrismaVectorStore.withModel(this.prismaClient).create(
    //   this.embeddings,
    //   {
    //     prisma: Prisma,
    //     tableName: 'Syllabus',
    //     vectorColumnName: 'vector',
    //     columns: {
    //       id: PrismaVectorStore.IdColumn,
    //       content: PrismaVectorStore.ContentColumn,
    //     },
    //   },
    // );
    // this.vectorStore = vectorStore;
    // this.logger.log('✅ Vector store initialized.');
  }

  async captureCalendarEvents(
    file: Buffer,
    fileName: string,
    mimeType: EMimeType,
  ) {
    this.logger.log(`📁 Storing file: ${fileName} with MIME type: ${mimeType}`);
    if (!allowedMimeTypes.includes(mimeType)) {
      this.logger.error('❌ Invalid file type');
      throw new Error('Invalid file type');
    }

    let documents: Document[] = [];
    if (mimeType === EMimeType.PDF) {
      this.logger.log('📄 Loading PDF file...');
      documents = await this.pdfLoader(file);
    } else if (mimeType === EMimeType.PLAIN_TEXT) {
      this.logger.log('📝 Loading plain text file...');
      documents = await this.textFileLoader(file);
    } else if (mimeType === EMimeType.DOCX) {
      this.logger.log('📄 Loading DOCX file...');
      documents = await this.docxLoader(file);
    } else if (mimeType === EMimeType.IMAGE_JPEG) {
      this.logger.log('🖼️ Loading image file...');
      documents = await this.imageLoader(file);
    }

    // await this.vectorStore.addDocuments(documents);
    // this.logger.log('✅ Documents added to vector store.');
    const result = await this.summarizeDocument(documents);
    this.logger.log('✅ Documents summarized.');
    return result;
  }

  private async pdfLoader(pdfFile: Buffer): Promise<Document[]> {
    this.logger.log('📄 Loading PDF document...');
    const fileBlob = new Blob([pdfFile], { type: EMimeType.PDF });
    const loader = new PDFLoader(fileBlob, {
      splitPages: true,
      parsedItemSeparator: '',
    });
    const docs = await loader.load();

    this.logger.log('✂️ Splitting PDF document...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 2500,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    this.logger.log('✅ PDF document loaded and split.');
    return splitDocs;
  }

  private async textFileLoader(textFile: Buffer): Promise<Document[]> {
    this.logger.log('📝 Loading text document...');
    const fileBlob = new Blob([textFile], { type: EMimeType.PLAIN_TEXT });
    const loader = new TextLoader(fileBlob);
    const docs = await loader.load();

    this.logger.log('✂️ Splitting text document...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 2500,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    this.logger.log('✅ Text document loaded and split.');
    return splitDocs;
  }

  private async docxLoader(docxFile: Buffer): Promise<Document[]> {
    this.logger.log('📄 Loading DOCX document...');
    const fileBlob = new Blob([docxFile], { type: EMimeType.DOCX });
    const loader = new DocxLoader(fileBlob);
    const docs = await loader.load();

    this.logger.log('✂️ Splitting DOCX document...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 2500,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    this.logger.log('✅ DOCX document loaded and split.');
    return splitDocs;
  }

  private async imageLoader(imageFile: Buffer): Promise<Document[]> {
    this.logger.log('🖼️ Processing image document...');
    const result = await this.vision.invoke(`Read all text from image`, {
      images: [imageFile.toString('base64')],
    });
    if (typeof result === 'string')
      return [{ pageContent: result, metadata: {} }];
    else return [{ pageContent: result.content as string, metadata: {} }];
  }

  public async summarizeDocument(docsSummary: Document[], filename?: string) {
    this.logger.log('📝 Starting document summarization...');

    const parser = StructuredOutputParser.fromZodSchema(
      summaryAndCalendarSchema,
    );

    const template = PromptTemplate.fromTemplate(
      `
        Date Now: {dateNow}
        Document: {text}
        \n{format_instructions}

        Find event name and put it to summary.
        Find event dates and timings. Put it to calendarEvents.
        Figure out title and description and type of the event.
        Convert dates to ISO format.
        If endDate is not found, set it to startDate + 1h.
        If date found without time set 10:00 as time.

        If events not found, set calendarEvents to empty array. And set summary to summary.
      `,
    );

    const chain = RunnableSequence.from([template, this.chat, parser]);

    await this.storeToFile.storeToFileText(docsSummary, ['calendar', 'input'], {
      filename,
    });

    const calendarEventsWithSummary: IFinalCalendarParts = {};
    const parts = Object.keys(docsSummary);
    for (const [part, doc] of Object.entries(docsSummary)) {
      this.logger.log(`🔍 Processing document part: ${part} / ${parts.length}`);
      const response = await this.invokeChainWithRetry(chain, doc, parser);
      calendarEventsWithSummary[part] = response;
      this.logger.log(
        `✅ Summarization complete for part: ${part} / ${parts.length}`,
      );
    }

    await this.storeToFile.storeToFileText(
      calendarEventsWithSummary,
      ['calendar', 'results'],
      { filename },
    );

    return calendarEventsWithSummary;
  }

  @Retry(5, 1000) // Retry up to 3 times with a 1-second delay
  async invokeChainWithRetry(
    chain: RunnableSequence,
    doc: Document<Record<string, any>>,
    parser: StructuredOutputParser<typeof summaryAndCalendarSchema>,
  ): Promise<ISummaryAndCalendar> {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const dateNow = { year, month };
    const response = await chain.invoke({
      text: doc.pageContent,
      format_instructions: parser.getFormatInstructions(),
      dateNow,
    });
    return response;
  }
}
