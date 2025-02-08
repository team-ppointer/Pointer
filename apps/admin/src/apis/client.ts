import { paths } from '@schema';
import {
  useMutation,
  UseMutationOptions as RQUseMutationOptions,
  UseQueryOptions as RQUseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import createClient from 'openapi-fetch';
import { HttpMethod, PathsWithMethod } from 'openapi-typescript-helpers';
import { FetchOptions } from 'openapi-fetch';

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_BASE_URL });

// useQuery type
type UseQueryOptions = RQUseQueryOptions<unknown, Error, unknown, readonly unknown[]>; // Add more options as needed

// useMutation type
type Paths<M extends HttpMethod> = PathsWithMethod<paths, M>;
type Params<M extends HttpMethod, P extends Paths<M>> = M extends keyof paths[P]
  ? FetchOptions<paths[P][M]>
  : never;
type UseMutationOptions = Pick<RQUseMutationOptions, 'retry'>;

export const get = <P extends Paths<'get'>>(
  path: P,
  params: Params<'get', P> & { rq?: UseQueryOptions }
) =>
  useQuery({
    queryKey: [path, params],
    queryFn: async () => {
      const { data, error } = await client.GET(path, params);
      if (error) throw error;
      return data;
    },
    ...params?.rq,
  });

export const post = <P extends Paths<'post'>>(path: P, options?: UseMutationOptions) =>
  useMutation({
    mutationFn: async (params: Params<'post', P>) => {
      const { data, error } = await client.POST(path, params);
      if (error) throw error;
      return data;
    },
    ...options,
  });

export const put = <P extends Paths<'put'>>(path: P, options?: UseMutationOptions) =>
  useMutation({
    mutationFn: async (params: Params<'put', P>) => {
      const { data, error } = await client.PUT(path, params);
      if (error) throw error;
      return data;
    },
    ...options,
  });

export const patch = <P extends Paths<'patch'>>(path: P, options?: UseMutationOptions) =>
  useMutation({
    mutationFn: async (params: Params<'patch', P>) => {
      const { data, error } = await client.PATCH(path, params);
      if (error) throw error;
      return data;
    },
    ...options,
  });

export const del = <P extends Paths<'delete'>>(path: P, options?: UseMutationOptions) =>
  useMutation({
    mutationFn: async (params: Params<'delete', P>) => {
      const { data, error } = await client.DELETE(path, params);
      if (error) throw error;
      return data;
    },
    ...options,
  });
