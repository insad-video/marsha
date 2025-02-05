import { Maybe } from 'lib-common';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { deleteTimedTextTrack } from 'data/sideEffects/deleteTimedTextTrack';
import {
  useTimedTextTrack,
  modelName,
  TimedText,
  uploadState,
  UPLOAD_FORM_ROUTE,
  ObjectStatusPicker,
} from 'lib-components';
import { ActionLink } from '../ActionLink/ActionLink';
import {
  LanguageChoice,
  useFetchTimedTextTrackLanguageChoices,
} from 'lib-video';

const messages = defineMessages({
  delete: {
    defaultMessage: 'Delete',
    description: 'Link text to delete a subtitle/transcript/captions item.',
    id: 'components.TimedTextListItem.delete',
  },
  replace: {
    defaultMessage: 'Replace',
    description:
      'Link text to replace a subtitle/transcript/captions item with a new file (for the same language).',
    id: 'components.TimedTextListItem.replace',
  },
  upload: {
    defaultMessage: 'Upload',
    description:
      'Link text to upload a missing subtitle/transcript/captions item file.',
    id: 'components.TimedTextListItem.upload',
  },
  download: {
    defaultMessage: 'Download',
    description: 'Link text to download a subtitle/transcript/captions item.',
    id: 'components.TimedTextListItem.download',
  },
});

const TimedTextListItemStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.15rem 0;
`;

const TimedTextListItemActions = styled.div`
  display: flex;
  align-items: center;
`;

const TimedTextListItemLanguage = styled.div`
  flex-basis: 10rem;
`;

const ObjectStatusPickerStyled = styled(ObjectStatusPicker)`
  flex-basis: 6rem;
`;

/** Props shape for the TimedTextListItem component. */
interface TimedTextListItemProps {
  track: TimedText;
}

export const TimedTextListItem = ({ track }: TimedTextListItemProps) => {
  const { data } = useFetchTimedTextTrackLanguageChoices();
  const choices = useMemo(
    () =>
      data?.actions.POST.language.choices?.map((choice) => ({
        label: choice.display_name,
        value: choice.value,
      })),
    [data?.actions.POST.language.choices],
  );
  const deleteTimedTextTrackRecord = useTimedTextTrack(
    (state) => state.removeResource,
  );

  const language: Maybe<LanguageChoice> =
    choices &&
    choices.find((languageChoice) => track.language === languageChoice.value);

  const deleteTrack = async () => {
    await deleteTimedTextTrack(track);
    deleteTimedTextTrackRecord(track);
  };

  return (
    <TimedTextListItemStyled>
      <TimedTextListItemLanguage>
        {language ? language.label : track.language}
      </TimedTextListItemLanguage>
      <ObjectStatusPickerStyled object={track} />
      <TimedTextListItemActions>
        <ActionLink
          color={'status-critical'}
          label={<FormattedMessage {...messages.delete} />}
          onClick={() => deleteTrack()}
        />
        &nbsp;/&nbsp;
        <Link to={UPLOAD_FORM_ROUTE(modelName.TIMEDTEXTTRACKS, track.id)}>
          <FormattedMessage
            {...(track.upload_state === uploadState.PENDING
              ? messages.upload
              : messages.replace)}
          />
        </Link>
        {track.upload_state === uploadState.READY && track.source_url && (
          <React.Fragment>
            &nbsp;/&nbsp;
            <a href={track.source_url}>
              <FormattedMessage {...messages.download} />
            </a>
          </React.Fragment>
        )}
      </TimedTextListItemActions>
    </TimedTextListItemStyled>
  );
};
