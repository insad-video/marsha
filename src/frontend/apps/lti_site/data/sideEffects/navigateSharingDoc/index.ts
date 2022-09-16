import { useJwt } from 'data/stores/useJwt';
import { API_ENDPOINT } from 'settings';
import { Video } from 'types/tracks';

export const navigateSharingDoc = async (
  video: Video,
  targetPage: number,
): Promise<Video> => {
  const response = await fetch(
    `${API_ENDPOINT}/videos/${video.id}/navigate-sharing/`,
    {
      headers: {
        Authorization: `Bearer ${useJwt.getState().jwt}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        target_page: targetPage,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update shared page for video ${video.id}.`);
  }

  return await response.json();
};