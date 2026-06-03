import { HttpStatus } from '@nestjs/common';

export class ResponseSuccess<T> {
  statusCode: number;
  timestamp: string; // ios formatted date string
  data: T;

  constructor(data: T, statusCode?: number) {
    this.statusCode = statusCode ?? HttpStatus.OK;
    this.timestamp = new Date().toISOString();
    this.data = data;
  }

  static ok<K>(data: K): ResponseSuccess<K> {
    return new ResponseSuccess<K>(data, HttpStatus.OK);
  }

  static created<K>(data: K): ResponseSuccess<K> {
    return new ResponseSuccess<K>(data, HttpStatus.CREATED);
  }
}
