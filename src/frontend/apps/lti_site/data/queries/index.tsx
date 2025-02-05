import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

import { Maybe } from 'lib-common';
import {
  actionOne,
  APIList,
  createOne,
  fetchList,
  FetchListQueryKey,
  fetchOne,
  Playlist,
  updateOne,
  useVideo as useVideoStore,
  Document,
  PortabilityRequest,
  Thumbnail,
  TimedText,
  Video,
  Organization,
} from 'lib-components';

export const useOrganization = (
  organizationId: string,
  queryConfig?: UseQueryOptions<Organization, 'organizations', Organization>,
) => {
  const key = ['organizations', organizationId];
  return useQuery<Organization, 'organizations'>(key, fetchOne, queryConfig);
};

export const usePlaylist = (
  playlistId: string,
  queryConfig?: UseQueryOptions<Playlist, 'playlists', Playlist>,
) => {
  const key = ['playlists', playlistId];
  return useQuery<Playlist, 'playlists'>(key, fetchOne, queryConfig);
};

type UseUpdatePlaylistData = Partial<
  Omit<Playlist, 'portable_to'> & { portable_to: string[] }
>;
type UseUpdatePlaylistError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdatePlaylistData]?: string[] }[];
    };
type UseUpdatePlaylistOptions = UseMutationOptions<
  Playlist,
  UseUpdatePlaylistError,
  UseUpdatePlaylistData
>;
export const useUpdatePlaylist = (
  id: string,
  options?: UseUpdatePlaylistOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, UseUpdatePlaylistError, UseUpdatePlaylistData>(
    (updatedPlaylist) =>
      updateOne({ name: 'playlists', id, object: updatedPlaylist }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('playlists');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('playlists');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type PlaylistsResponse = APIList<Playlist>;
type UsePlaylistsParams = { organization: Maybe<string> };
export const usePlaylists = (
  params: UsePlaylistsParams,
  queryConfig?: UseQueryOptions<
    PlaylistsResponse,
    'playlists',
    PlaylistsResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['playlists', params];
  return useQuery<
    PlaylistsResponse,
    'playlists',
    PlaylistsResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

export const useThumbnail = (
  thumbnailId: string,
  queryConfig?: UseQueryOptions<Thumbnail, 'thumbnails', Thumbnail>,
) => {
  const key = ['thumbnails', thumbnailId];
  return useQuery<Thumbnail, 'thumbnails'>(key, fetchOne, queryConfig);
};

type TimedTextTracksResponse = APIList<TimedText>;
type UseTimedTextTracksParams = { video: string };
export const useTimedTextTracks = (
  params: UseTimedTextTracksParams,
  queryConfig?: UseQueryOptions<
    TimedTextTracksResponse,
    'timedtexttracks',
    TimedTextTracksResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['timedtexttracks', params];
  return useQuery<
    TimedTextTracksResponse,
    'timedtexttracks',
    TimedTextTracksResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

export const useStartLiveRecording = (id: string, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Video>(
    () =>
      actionOne({
        name: 'videos',
        id,
        action: 'start-recording',
        method: 'PATCH',
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('videos');
        useVideoStore.getState().addResource(data);
      },
      onError: () => {
        queryClient.invalidateQueries('videos');
        onError();
      },
    },
  );
};

export const useStopLiveRecording = (id: string, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Video>(
    () =>
      actionOne({
        name: 'videos',
        id,
        action: 'stop-recording',
        method: 'PATCH',
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('videos');
        useVideoStore.getState().addResource(data);
      },
      onError: () => {
        queryClient.invalidateQueries('videos');
        onError();
      },
    },
  );
};

type UseCreateDocumentData = {
  playlist: string;
  title: string;
  description?: string;
  lti_id?: string;
};
type UseCreateDocumentError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreateDocumentData]?: string[] }[];
    };
type UseCreateDocumentOptions = UseMutationOptions<
  Document,
  UseCreateDocumentError,
  UseCreateDocumentData
>;
export const useCreateDocument = (options?: UseCreateDocumentOptions) => {
  const queryClient = useQueryClient();
  return useMutation<Document, UseCreateDocumentError, UseCreateDocumentData>(
    (newDocument) => createOne({ name: 'documents', object: newDocument }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('documents');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};

type UseCreatePortabilityRequestData = {
  for_playlist: string;
  from_playlist: string;
  // for now, only allow request creation from LTI context
  from_lti_consumer_site: string; // mandatory in LTI
  from_lti_user_id: string; // mandatory in LTI
};
type UseCreatePortabilityRequestError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreatePortabilityRequestData]?: string[] }[];
    };
type UseCreatePortabilityRequestOptions = UseMutationOptions<
  PortabilityRequest,
  UseCreatePortabilityRequestError,
  UseCreatePortabilityRequestData
>;
export const useCreatePortabilityRequest = (
  options?: UseCreatePortabilityRequestOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PortabilityRequest,
    UseCreatePortabilityRequestError,
    UseCreatePortabilityRequestData
  >(
    (newPortabilityRequest) =>
      createOne({
        name: 'portability-requests',
        object: newPortabilityRequest,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('portability-requests');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};
