import { Injectable, Logger } from '@nestjs/common';

import {
  IFinalCalendarParts,
  ISummaryAndCalendar,
} from '../llm-module/interfaces';
import { CalendarEventType } from './dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  public async storeCalendarResults(
    calendarResults: IFinalCalendarParts,
    userId: number,
    eventType: CalendarEventType,
    courseId: number,
  ): Promise<any> {
    for (const data of Object.values(calendarResults)) {
      const parsedData = data as ISummaryAndCalendar;
      for (const event of parsedData.calendarEvents) {
        const startDate = new Date(event.start);
        let endDate = new Date(event.end);
        const title = event.title || 'No title';
        const description = event.description || 'No description';
        if (startDate.toString() === 'Invalid Date') {
          this.logger.warn('Invalid Date', startDate);
          continue;
        }
        if (endDate.toString() === 'Invalid Date') {
          this.logger.warn('Invalid Date', endDate);
          endDate = null;
        }

        this.logger.log('📅 Storing event...', {
          title,
          description,
          startDate,
          endDate,
          eventType,
          courseId,
          userId,
        });

        // Store the event in the database
        // const storedEvent = await this.prisma.calendarEvent
        //   .create({
        //     data: {
        //       title,
        //       description,
        //       startDate: new Date(event.start),
        //       endDate: new Date(event.end),
        //       type: eventType,
        //       course: { connect: { id: courseId } },
        //       user: { connect: { id: userId } },
        //     },
        //   })
        //   .catch((e) => {
        //     this.logger.warn('Error storing calendar event', e);
        //   });
        // if (storedEvent) eventsIds.push(storedEvent.id);
      }
    }
  }
}
