import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { disconnect, Types } from 'mongoose';
import { CreateRoomDto } from '../src/rooms/dto/create-room.dto';
import { RoomDocument, RoomModel } from '../src/rooms/rooms.model';
import {
  ScheduleDocument,
  ScheduleModel,
} from '../src/schedule/schedule.model';
import {
  ROOM_SCHEDULED,
  SCHEDULE_NOT_FOUND,
} from '../src/schedule/schedule-constants';
import { ROOM_NOT_FOUND } from '../src/rooms/room-constants';

const testRoomDto: CreateRoomDto = {
  number: 5,
  hasSeaView: true,
  type: 'some room type',
};

const testRoomDtoSecond: CreateRoomDto = {
  number: 7,
  hasSeaView: false,
  type: 'some room type other',
};

const testDate = new Date('1995-12-17T03:24:00');
const testDateSecond = new Date('1995-12-18T03:24:00');
let createdRoomId: string;
let createdRoomIdSecond: string;
let createdId: string;
let createdIdSecond: string;

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/rooms/create')
      .send(testRoomDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdRoomId = (body as RoomDocument)._id.toString();
        expect(createdRoomId).toBeDefined();
      });

    await request(app.getHttpServer())
      .post('/rooms/create')
      .send(testRoomDtoSecond)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdRoomIdSecond = (body as RoomDocument)._id.toString();
        expect(createdRoomIdSecond).toBeDefined();
      });
  });

  test('/schedule/create (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/schedule/create')
      .send({ date: testDate, roomId: createdRoomId })
      .expect(201)
      .then(({ body }: request.Response) => {
        createdId = (body as ScheduleDocument)._id.toString();
        expect(createdId).toBeDefined();
      });
  });
  test('/schedule/create (POST) - fail room not found', () => {
    return request(app.getHttpServer())
      .post('/schedule/create')
      .send({ date: testDate, roomId: new Types.ObjectId().toHexString() })
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });

  test('/schedule/create (POST) - fail', () => {
    return request(app.getHttpServer())
      .post('/schedule/create')
      .send({ date: testDate, roomId: createdRoomId })
      .expect(409, {
        statusCode: 409,
        message: ROOM_SCHEDULED,
      });
  });

  test('/schedule/create (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/schedule/create')
      .send({ date: testDateSecond, roomId: createdRoomId })
      .expect(201)
      .then(({ body }: request.Response) => {
        createdIdSecond = (body as ScheduleDocument)._id.toString();
        expect(createdId).toBeDefined();
      });
  });

  test('/schedule (POST) - fail', () => {
    return request(app.getHttpServer())
      .post('/schedule/create')
      .send({ date: testDate, roomId: createdRoomId })
      .expect(409, {
        statusCode: 409,
        message: ROOM_SCHEDULED,
      });
  });

  test('/schedule/ (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/schedule/' + createdId)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as ScheduleDocument)._id).toBeDefined();
      });
  });
  test('/schedule/ (GET) - fail', () => {
    return request(app.getHttpServer())
      .get('/schedule/' + new Types.ObjectId().toHexString())
      .expect(404)
  });

  test('/schedule/all (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/schedule/')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as ScheduleModel[]).length).toBe(2);
      });
  });

  test('/schedule/byRoom (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/schedule/byRoom/' + createdRoomId)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as ScheduleModel[]).length).toBe(2);
      });
  });

  test('/schedule/ (GET) - fail', () => {
    return request(app.getHttpServer())
      .get('/schedule/' + new Types.ObjectId().toHexString())
      .expect(404)
  });
  test('/schedule (PATCH) - success', () => {
    return request(app.getHttpServer())
      .patch('/schedule/' + createdId)
      .send({ date: testDateSecond, roomId: createdRoomIdSecond })
      .expect(200);
  });
  test('/schedule (PATCH) - fail', () => {
    return request(app.getHttpServer())
      .patch('/schedule/' + createdIdSecond)
      .send({ date: testDateSecond, roomId: createdRoomIdSecond })
      .expect(409, {
        statusCode: 409,
        message: ROOM_SCHEDULED,
      });
  });
  test('/schedule (PATCH) - wrong Room ID', () => {
    return request(app.getHttpServer())
      .patch('/schedule/' + createdIdSecond)
      .send({
        date: testDateSecond,
        roomId: new Types.ObjectId().toHexString(),
      })
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });
  test('/schedule (PATCH) - wrongID', () => {
    return request(app.getHttpServer())
      .patch('/schedule/' + new Types.ObjectId().toHexString())
      .send({ date: testDateSecond, roomId: createdRoomIdSecond })
      .expect(404, {
        statusCode: 404,
        message: SCHEDULE_NOT_FOUND,
      });
  });

  test('/schedule (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/schedule/' + createdId)
      .expect(200);
  });

  test('/schedule (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/schedule/' + createdIdSecond)
      .expect(200);
  });

  test('/schedule (GET) - success deleted', () => {
    return request(app.getHttpServer())
      .get('/schedule/' + createdId)
      .expect(404, {
        statusCode: 404,
        message: SCHEDULE_NOT_FOUND,
      });
  });

  test('/schedule (DELETE) - fail', () => {
    return request(app.getHttpServer())
      .delete('/schedule/' + new Types.ObjectId().toHexString())
      .expect(404, {
        statusCode: 404,
        message: SCHEDULE_NOT_FOUND,
      });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/rooms/' + createdRoomId)
      .expect(200);
    await request(app.getHttpServer())
      .delete('/rooms/' + createdRoomIdSecond)
      .expect(200);
    await disconnect();
  });
});
