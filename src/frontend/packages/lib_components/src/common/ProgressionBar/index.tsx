import { Box, Meter, Stack, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { theme } from 'lib-common';
import React from 'react';

interface ProgressionBarProps {
  progressPercentage: number;
}

export const ProgressionBar = ({ progressPercentage }: ProgressionBarProps) => {
  return (
    <Box direction="row">
      <Stack anchor="center">
        <Meter round size="xlarge" type="bar" value={progressPercentage} />
        <Text
          color={
            progressPercentage < 45
              ? normalizeColor('blue-active', theme)
              : 'white'
          }
          size="0.725rem"
        >
          {progressPercentage} %
        </Text>
      </Stack>
    </Box>
  );
};
