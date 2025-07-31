import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import mongoose, { disconnect, Types } from 'mongoose';
import { CreateRoomDto } from '../src/rooms/dto/create-room.dto';
import { RoomDocument, RoomModel } from '../src/rooms/rooms.model';
import { ROOM_NOT_FOUND } from '../src/rooms/room-constants';

const testDto: CreateRoomDto = {
  number: 5,
  hasSeaView: true,
  type: 'some room type',
};
const testWrongDto = {
  number: '',
  type: false,
};
let createdId: string;

const editedDto: CreateRoomDto = {
  number: 7,
  hasSeaView: false,
  type: 'some room type new',
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

  });

  test('/rooms/create (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/rooms/create')
      .send(testDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdId = (body as RoomDocument)._id.toString();
        expect(createdId).toBeDefined();
      });
  });
  test('/rooms/create (POST) - fail', () => {
    return request(app.getHttpServer())
      .post('/rooms/create')
      .send(testWrongDto)
      .expect(500)
      .then(({ body }: request.Response) => {
      });
  });
  test('/rooms (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/rooms')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel[]).length).toBe(1);
        expect((body as RoomModel[])[0].number).toBe(testDto.number);
      });
  });

  test('/rooms/:id (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/rooms/' + createdId)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel).number).toBe(testDto.number);
        expect((body as RoomModel).hasSeaView).toBe(testDto.hasSeaView);
        expect((body as RoomModel).type).toBe(testDto.type);
      });
  });

  test('/rooms/:id (GET) - fail', () => {
    return request(app.getHttpServer())
      .get('/rooms/' + new Types.ObjectId().toHexString())
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });

  test('/rooms/:id (PATCH) - success', () => {
    return request(app.getHttpServer())
      .patch('/rooms/' + createdId)
      .send(editedDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel).number).toBe(editedDto.number);
        expect((body as RoomModel).hasSeaView).toBe(editedDto.hasSeaView);
        expect((body as RoomModel).type).toBe(editedDto.type);
      });
  });

  test('/rooms/:id (PATCH) - fail', () => {
    return request(app.getHttpServer())
      .patch('/rooms/' + new Types.ObjectId().toHexString())
      .send(editedDto)
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });

  test('/rooms/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/rooms/' + createdId)
      .expect(200);
  });

  test('/rooms/:id (DELETE) - fail', () => {
    return request(app.getHttpServer())
      .delete('/rooms/' + new Types.ObjectId().toHexString())
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });
  test('/rooms (GET) - empty', () => {
    return request(app.getHttpServer())
      .get('/rooms')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel[]).length).toBe(0);
      });
  });

  afterAll(async () => {
    await disconnect();
  });
});
