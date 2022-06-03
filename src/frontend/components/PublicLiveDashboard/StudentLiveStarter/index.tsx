import { DateTime } from 'luxon';
import React, { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';
import { FullScreenError } from 'components/ErrorComponents';
import { StudentLiveAdvertising } from 'components/StudentLiveAdvertising';
import { StudentLiveWrapper } from 'components/StudentLiveWrapper';
import { getDecodedJwt } from 'data/appData';
import { pollForLive } from 'data/sideEffects/pollForLive';
import { useLiveStateStarted } from 'data/stores/useLiveStateStarted';
import { useParticipantWorkflow } from 'data/stores/useParticipantWorkflow';
import { modelName } from 'types/models';
import { JoinMode, Live, liveState } from 'types/tracks';
import { Maybe } from 'utils/types';
import { converse } from 'utils/window';

interface StudentLiveStarterProps {
  live: Live;
  playerType: string;
}

export const StudentLiveStarter = ({
  live,
  playerType,
}: StudentLiveStarterProps) => {
  const intl = useIntl();
  const liveScheduleStartDate = useMemo(() => {
    if (!live.starting_at) {
      return undefined;
    }

    return DateTime.fromISO(live.starting_at).setLocale(intl.locale);
  }, [live, intl]);
  const { isStarted, setIsLiveStarted } = useLiveStateStarted((state) => ({
    isStarted: state.isStarted,
    setIsLiveStarted: state.setIsStarted,
  }));
  const { isParticipantOnstage, hasParticipantAsked, setAsked } =
    useParticipantWorkflow((state) => ({
      isParticipantOnstage: state.accepted,
      hasParticipantAsked: state.asked,
      setAsked: state.setAsked,
    }));

  useEffect(() => {
    let canceled = false;
    const poll = async () => {
      if (
        isStarted ||
        !live.urls ||
        live.live_state !== liveState.RUNNING ||
        live.join_mode === JoinMode.FORCED
      ) {
        return;
      }

      await pollForLive(live.urls);
      if (canceled) {
        return;
      }

      setIsLiveStarted(true);
    };

    poll();
    return () => {
      canceled = true;
    };
  }, [live, isStarted]);

  useEffect(() => {
    let askParticipantToJoinTimeout: Maybe<number>;
    let waitAskParticipantToJoinTimeout: Maybe<number>;

    // Try to ask participant to join
    // Retry as the room may not be ready yet
    const askParticipantToJoin = async () => {
      try {
        await converse.askParticipantToJoin();
        setAsked();
      } catch (_) {
        askParticipantToJoinTimeout = window.setTimeout(
          askParticipantToJoin,
          1000,
        );
      }
    };

    // Wait for askParticipantToJoin to be loaded in converse
    // Retry as all converse plugins may not be loaded yet
    const waitAskParticipantToJoinLoaded = () => {
      if (!converse.askParticipantToJoin) {
        waitAskParticipantToJoinTimeout = window.setTimeout(
          waitAskParticipantToJoinLoaded,
          1000,
        );
      } else {
        askParticipantToJoin();
      }
    };

    if (
      live.join_mode === JoinMode.FORCED &&
      !hasParticipantAsked &&
      !isParticipantOnstage
    ) {
      waitAskParticipantToJoinLoaded();
    }

    return () => {
      if (askParticipantToJoinTimeout) {
        window.clearTimeout(askParticipantToJoinTimeout);
      }
      if (waitAskParticipantToJoinTimeout) {
        window.clearTimeout(waitAskParticipantToJoinTimeout);
      }
    };
  }, [hasParticipantAsked, isParticipantOnstage, live, setAsked]);

  useEffect(() => {
    if (
      live.join_mode === JoinMode.FORCED &&
      isParticipantOnstage &&
      !isStarted
    ) {
      setIsLiveStarted(true);
    }
  }, [isParticipantOnstage, isStarted, live]);

  // reset live state on live stop
  useEffect(() => {
    if (
      isStarted &&
      !isParticipantOnstage &&
      ((live.join_mode !== JoinMode.FORCED &&
        live.live_state !== liveState.RUNNING) ||
        (live.join_mode === JoinMode.FORCED &&
          ![liveState.RUNNING, liveState.STARTING].includes(live.live_state)))
    ) {
      setIsLiveStarted(false);
    }
  }, [isParticipantOnstage, isStarted, live.join_mode, live.live_state]);

  const isScheduledPassed =
    (liveScheduleStartDate && liveScheduleStartDate < DateTime.now()) ||
    !liveScheduleStartDate;

  if (
    getDecodedJwt().permissions.can_update &&
    [liveState.STOPPING, liveState.STOPPED].includes(live.live_state)
  ) {
    // user has update permission, we redirect him to the dashboard
    return <Redirect push to={DASHBOARD_ROUTE(modelName.VIDEOS)} />;
  } else if (
    [
      liveState.STOPPING,
      liveState.STOPPED,
      liveState.HARVESTING,
      liveState.HARVESTED,
    ].includes(live.live_state) &&
    isScheduledPassed
  ) {
    return <FullScreenError code={'liveStopped'} />;
  } else if (!isStarted) {
    return <StudentLiveAdvertising video={live} />;
  }
  return <StudentLiveWrapper video={live} playerType={playerType} />;
};