import { Box, Heading, Paragraph } from 'grommet';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { H2 } from 'common/Headings';
import { LayoutMainArea } from 'common/LayoutMainArea';

export * from './BoundaryScreenError';
export * from './route';

export interface ErrorComponentsProps {
  code:
    | 'generic'
    | 'lti'
    | 'notFound'
    | 'policy'
    | 'upload'
    | 'liveIncompatible'
    | 'liveInit'
    | 'liveToVod'
    | 'liveStopped'
    | 'videoDeleted'
    | 'fileTooLarge';
}

const FullScreenErrorStyled = styled(LayoutMainArea)`
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  flex-grow: 1;
  padding-top: 4rem;
  padding-bottom: 6rem;
  text-align: center;
`;

const messages = {
  generic: defineMessages({
    text: {
      defaultMessage: `We could not access the appropriate resources. You can try reloading the page or come back again at a later time.`,
      description:
        'Helpful text for the generic error message (random API request failure).',
      id: 'components.ErrorComponents.generic.text',
    },
    title: {
      defaultMessage: 'There was an unexpected error',
      description:
        'Title for the generic error message (random API request failure).',
      id: 'components.ErrorComponents.generic.title',
    },
  }),
  lti: defineMessages({
    text: {
      defaultMessage: `We could not validate your access to this video. Please contact your instructor.
      If you are the instructor, please check your settings.`,
      description: 'Helpful text for the LTI error page',
      id: 'components.ErrorComponents.lti.text',
    },
    title: {
      defaultMessage: 'There was an error loading this video',
      description: 'Title for the LTI error page',
      id: 'components.ErrorComponents.lti.title',
    },
  }),
  notFound: defineMessages({
    text: {
      defaultMessage: `This video does not exist or has not been published yet.
      If you are an instructor, please make sure you are properly authenticated.`,
      description: 'Helpful text for the 404 Not Found error page',
      id: 'components.ErrorComponents.notFound.text',
    },
    title: {
      defaultMessage: 'The video you are looking for could not be found',
      description: 'Title for the 404 Not Found error page',
      id: 'components.ErrorComponents.notFound.title',
    },
  }),
  policy: defineMessages({
    text: {
      defaultMessage:
        'We could not make sure you are allowed to upload a video file. Please check your settings and/or try again.',
      description: 'Title for the upload permission error page',
      id: 'components.ErrorComponents.policy.text',
    },
    title: {
      defaultMessage: 'Failed to authenticate your permission to upload',
      description: 'Helpful text for the upload permission error page',
      id: 'components.ErrorComponents.policy.title',
    },
  }),
  upload: defineMessages({
    text: {
      defaultMessage:
        'You can try again later. You may want to check your Internet connection quality.',
      description: 'Helpful text for the Upload error page',
      id: 'components.ErrorComponents.upload.text',
    },
    title: {
      defaultMessage: 'Failed to upload your video file',
      description: 'Title for the video upload error page',
      id: 'components.ErrorComponents.upload.title',
    },
  }),
  liveIncompatible: defineMessages({
    text: {
      defaultMessage:
        'You can try again later. You may want to check your Internet connection quality.',
      description: 'Helpful text for the Upload error page',
      id: 'components.ErrorComponents.upload.text',
    },
    title: {
      defaultMessage: 'Live mode incompatible with this object',
      description: 'Title when the object is incompatible with live mode',
      id: 'components.ErrorComponents.liveIncompatible.title',
    },
  }),
  liveInit: {
    text: {
      defaultMessage:
        'We could not make sure you are allowed to modify a live. Please check your settings and/or try again.',
      description: 'Title for the live permission error page',
      id: 'components.ErrorComponents.liveInit.text',
    },
    title: {
      defaultMessage: 'Failed to authenticate your permission to modify a live',
      description: 'Helpful text for the upload permission error page',
      id: 'components.ErrorComponents.liveInit.title',
    },
  },
  liveToVod: {
    text: {
      defaultMessage: 'Failed to publish a VOD',
      description: 'Error title when publish a live to VOD fails.',
      id: 'components.ErrorComponents.liveToVod.title',
    },
    title: {
      defaultMessage:
        'We could not publish this video as a VOD. Please retry later',
      description: 'Error message when publish a live to VOD fails.',
      id: 'components.ErrorComponents.liveToVod.text',
    },
  },
  liveStopped: {
    text: {
      defaultMessage:
        'This live has now ended. If the host decides to publish the recording, the video will be available here in a while.',
      description:
        'Text explaining that a live has ended and that the VOD may be available soon.',
      id: 'components.ErrorComponents.liveStopped.text',
    },
    title: {
      defaultMessage: 'This live has ended',
      description:
        'Title for a user without update permission when a live is stopped or stopping',
      id: 'components.ErrorComponents.liveStopped.title',
    },
  },
  videoDeleted: {
    text: {
      defaultMessage: 'This video is deleted and you can no longer watch it.',
      description:
        'Text explaining that a live has been deleted (or a lived has ended without any record).',
      id: 'components.ErrorComponents.videoDeleted.text',
    },
    title: {
      defaultMessage: 'This video is deleted',
      description:
        'Title for a user accessing a deleted video (or a live ended without any record).',
      id: 'components.ErrorComponents.videoDeleted.title',
    },
  },
  fileTooLarge: {
    text: {
      defaultMessage: 'This file is too large to be uploaded.',
      description: 'Text explaining that the file provided is too large.',
      id: 'components.ErrorComponents.fileTooLarge.text',
    },
    title: {
      defaultMessage: 'This file is too large',
      description: 'Title for a user trying to upload a too large file.',
      id: 'components.ErrorComponents.fileTooLarge.title',
    },
  },
};

export const ErrorMessage: React.FC<ErrorComponentsProps> = ({ code }) => (
  <Box direction="column" pad="medium" align="center">
    <Heading level={6} margin={{ bottom: 'small' }}>
      <FormattedMessage {...messages[code].title} />
    </Heading>
    <Paragraph>
      <FormattedMessage {...messages[code].text} />
    </Paragraph>
  </Box>
);

export const FullScreenError: React.FC<ErrorComponentsProps> = ({ code }) => (
  <FullScreenErrorStyled>
    <ErrorContent>
      <H2>
        <FormattedMessage {...messages[code].title} />
      </H2>
      <Paragraph>
        <FormattedMessage {...messages[code].text} />
      </Paragraph>
    </ErrorContent>
  </FullScreenErrorStyled>
);
