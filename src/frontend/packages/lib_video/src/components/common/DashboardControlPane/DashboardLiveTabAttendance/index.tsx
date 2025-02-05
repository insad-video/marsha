import { Box, Spinner } from 'grommet';
import { ErrorMessage, liveState, ShouldNotHappen } from 'lib-components';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { useLiveAttendances } from 'api/useLiveAttendances';
import { POLL_FOR_ATTENDANCES } from 'conf/sideEffects';
import { useCurrentVideo } from 'hooks/useCurrentVideo';

import { DashboardLiveTabAttendanceSession } from './DashboardLiveTabAttendanceSession';
import { DashboardLiveTabAttendanceWaiting } from './DashboardLiveTabAttendanceWaiting';

const messages = defineMessages({
  loading: {
    defaultMessage: 'Loading attendances...',
    description:
      'Accessible message for the spinner while loading the attendances.',
    id: 'components.DashboardLiveControlPane.tab.DashboardLivettendance.loading',
  },
});

interface InternalProps {
  live_state: Exclude<liveState, liveState.IDLE>;
  video_id: string;
}

const Internal = ({ live_state, video_id }: InternalProps) => {
  const refetchInterval = [liveState.STOPPING, liveState.RUNNING].includes(
    live_state,
  )
    ? POLL_FOR_ATTENDANCES
    : false;

  // only if the video is running or is stopping, we refresh the list
  const { data, status } = useLiveAttendances(video_id, {
    refetchInterval,
    refetchIntervalInBackground: !!refetchInterval,
    refetchOnWindowFocus: !!refetchInterval,
  });

  switch (status) {
    case 'idle':
    case 'loading':
      return (
        <Box width="full">
          <Spinner size="large">
            <FormattedMessage {...messages.loading} />
          </Spinner>
        </Box>
      );
    case 'error':
      return (
        <Box width="full">
          <ErrorMessage code="generic" />
        </Box>
      );
    case 'success':
      return (
        <Box width="full">
          {data.count > 0 && (
            <Box
              background="white"
              direction="column"
              margin={{ top: 'small' }}
              pad={{ top: 'medium' }}
              round="6px"
              style={{
                boxShadow: '0px 0px 6px 0px rgba(2, 117, 180, 0.3)',
                minHeight: '70px',
              }}
            >
              {data.results.map((liveSession) => (
                <DashboardLiveTabAttendanceSession
                  key={liveSession.id}
                  liveSession={liveSession}
                />
              ))}
            </Box>
          )}
          {data.count === 0 && <DashboardLiveTabAttendanceWaiting />}
        </Box>
      );
    default:
      throw new ShouldNotHappen(status);
  }
};

export const DashboardLiveTabAttendance = () => {
  const video = useCurrentVideo();

  if (!video.live_state || video.live_state === liveState.IDLE) {
    return <DashboardLiveTabAttendanceWaiting />;
  }

  return <Internal live_state={video.live_state} video_id={video.id} />;
};
