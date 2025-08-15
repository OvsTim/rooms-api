import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import mongoose, { disconnect, Types } from 'mongoose';
import { CreateRoomDto } from '../src/rooms/dto/create-room.dto';
import { RoomDocument, RoomModel } from '../src/rooms/rooms.model';
import { ROOM_NOT_FOUND } from '../src/rooms/room-constants';
import { AuthDto } from '../src/auth/dto/auth.dto';

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
const loginDto: AuthDto = {
  login: 'test@test.ru',
  password: '1',
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    app.setGlobalPrefix('api');
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    token = res.body.access_token;
  });

  test('/rooms/create (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/api/rooms/create')
      .set('Authorization', 'Bearer ' + token)
      .send(testDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdId = (body as RoomDocument)._id.toString();
        expect(createdId).toBeDefined();
      });
  });
  test('/rooms/create (POST) - fail', () => {
    return request(app.getHttpServer())
      .post('/api/rooms/create')
      .set('Authorization', 'Bearer ' + token)
      .send(testWrongDto)
      .expect(500)
      .then(({ body }: request.Response) => {});
  });
  test('/rooms/create (POST) - fail types', () => {
    return request(app.getHttpServer())
      .post('/api/rooms/create')
      .set('Authorization', 'Bearer ' + token)
      .send({ ...testDto, type: false })
      .expect(400)
      .then(({ body }: request.Response) => {});
  });
  test('/rooms (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/api/rooms')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel[]).length).toBe(1);
        expect((body as RoomModel[])[0].number).toBe(testDto.number);
      });
  });

  test('/rooms/:id (GET) - success', () => {
    return request(app.getHttpServer())
      .get('/api/rooms/' + createdId)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel).number).toBe(testDto.number);
        expect((body as RoomModel).hasSeaView).toBe(testDto.hasSeaView);
        expect((body as RoomModel).type).toBe(testDto.type);
      });
  });

  test('/rooms/:id (GET) - fail', () => {
    return request(app.getHttpServer())
      .get('/api/rooms/' + new Types.ObjectId().toHexString())
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });

  test('/rooms/:id (PATCH) - success', () => {
    return request(app.getHttpServer())
      .patch('/api/rooms/' + createdId)
      .set('Authorization', 'Bearer ' + token)
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
      .patch('/api/rooms/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token)
      .send(editedDto)
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });
  test('/rooms/:id (PATCH) - fail types', () => {
    return request(app.getHttpServer())
      .patch('/api/rooms/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token)
      .send({ ...editedDto, type: true })
      .expect(400);
  });

  test('/rooms/:id (DELETE) - success', () => {
    return request(app.getHttpServer())
      .delete('/api/rooms/' + createdId)
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  test('/rooms/:id (DELETE) - fail', () => {
    return request(app.getHttpServer())
      .delete('/api/rooms/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token)
      .expect(404, {
        statusCode: 404,
        message: ROOM_NOT_FOUND,
      });
  });
  test('/rooms (GET) - empty', () => {
    return request(app.getHttpServer())
      .get('/api/rooms')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect((body as RoomModel[]).length).toBe(0);
      });
  });

  afterAll(async () => {
    await disconnect();
  });
});
