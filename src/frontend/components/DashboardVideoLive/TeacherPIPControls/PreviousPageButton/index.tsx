import { Box, Button } from 'grommet';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import styled from 'styled-components';

import { DownArrowSVG } from 'components/SVGIcons/DownArrowSVG';
import { navigateSharingDoc } from 'data/sideEffects/navigateSharingDoc';
import { useSharedMediaCurrentPage } from 'data/stores/useSharedMediaCurrentPage';
import { Video } from 'types/tracks';

const messages = defineMessages({
  title: {
    defaultMessage: 'Previous page',
    description: 'Sharing document previous page button title text',
    id: 'components.DashboardVideoLive.TeacherPIPControls.PreviousPageButton.title',
  },
});

const StyledBytton = styled(Button)`
  border-radius: 50%;
  transform: rotate(90deg);
  padding: 10px;
`;

interface PreviousPageButtonProps {
  video: Video;
}

export const PreviousPageButton = ({ video }: PreviousPageButtonProps) => {
  const intl = useIntl();
  const [currentPage] = useSharedMediaCurrentPage();

  return (
    <StyledBytton
      a11yTitle={intl.formatMessage(messages.title)}
      disabled={currentPage.page <= 1}
      primary
      label={
        <Box height="30px" width="30px">
          <DownArrowSVG iconColor="white" width="100%" height="100%" />
        </Box>
      }
      onClick={() => navigateSharingDoc(video, currentPage.page - 1)}
    />
  );
};