import { createMock } from "@golevelup/ts-jest";
import { RedisClient } from "../data";

export const mockedRedisClient = createMock<RedisClient>({}) as unknown as jest.Mocked<RedisClient>