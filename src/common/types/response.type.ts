import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseSuccess<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '2026-06-04T02:09:04.385Z' })
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

export class ResponsePaginatedSuccess<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty({ example: '2026-06-04T02:09:04.385Z' })
  timestamp: string; // ios formatted date string

  data: {
    items: T[];
    metadata: PaginationMetadataType;
  };

  constructor(items: T[], metadata: PaginationMetadataType) {
    this.statusCode = HttpStatus.OK;
    this.timestamp = new Date().toISOString();
    this.data = { items, metadata };
  }
}

export class PaginationMetadataType {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  sort: string;

  @ApiProperty({ enum: ['asc', 'desc'], default: 'desc' })
  order: 'asc' | 'desc';
}
