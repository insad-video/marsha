import { Grommet } from 'grommet';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderImageSnapshot } from 'utils/tests/imageSnapshot';
import { wrapInIntlProvider } from 'utils/tests/intl';
import { GlobalStyles } from 'utils/theme/baseStyles';
import { theme } from 'utils/theme/theme';
import { JoinChatButton } from './index';

const mockHandleClick = jest.fn();

describe('<JoinChatButton />', () => {
  it('renders the button and compares it with previous snapshot.', async () => {
    await renderImageSnapshot(<JoinChatButton handleClick={mockHandleClick} />);
    screen.getByText('Join the chat');
  });

  it('renders the button and clicks on it.', () => {
    render(
      wrapInIntlProvider(
        <Grommet theme={theme}>
          <JoinChatButton handleClick={mockHandleClick} />
          <GlobalStyles />
        </Grommet>,
      ),
    );
    const button = screen.getByRole('button');
    userEvent.click(button);
    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });
});