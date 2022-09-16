import { useJwt } from 'data/stores/useJwt';
import { API_ENDPOINT } from 'settings';
import { LiveSession } from 'types/tracks';

export const setLiveSessionDisplayName = async (
  displayName: string,
  anonymousId?: string,
): Promise<{
  error?: string | number;
  success?: LiveSession;
}> => {
  const body = {
    display_name: displayName,
    anonymous_id: anonymousId,
  };

  const response = await fetch(`${API_ENDPOINT}/livesessions/display_name/`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${useJwt.getState().jwt}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });

  if (response.status === 409) {
    return { error: 409 };
  }

  if (!response.ok) {
    return { error: await response.json() };
  }

  return { success: await response.json() };
};