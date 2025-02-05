import {
  fetchWrapper,
  useJwt,
  API_ENDPOINT,
  LiveModeType,
  Video,
} from 'lib-components';

/**
 * Post to an action endpoint that declares the beginning of live video.
 * Returns the updated video
 * @param video initiate a live mode on this video
 */
export const initiateLive = async (
  video: Video,
  type: LiveModeType,
): Promise<Video> => {
  const response = await fetchWrapper(
    `${API_ENDPOINT}/videos/${video.id}/initiate-live/`,
    {
      headers: {
        Authorization: `Bearer ${useJwt.getState().jwt ?? ''}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        type,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to initialize a live mode for video ${video.id}.`);
  }

  return (await response.json()) as Video;
};
