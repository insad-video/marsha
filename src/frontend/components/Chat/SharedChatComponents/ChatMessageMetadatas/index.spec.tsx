import { DateTime } from 'luxon';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { wrapInIntlProvider } from 'utils/tests/intl';

import { ChatMessageMetadatas } from '.';

describe('<ChatMessageMetadatas />', () => {
  it('renders the chatMessagesMetadatas and checks displayed information and sizes are correct.', () => {
    render(
      wrapInIntlProvider(
        <ChatMessageMetadatas
          msgSender={'John Doe'}
          msgDatetime={DateTime.fromISO('2020-01-01T12:12:12')}
        />,
      ),
    );
    const chatAvatarDiv = screen.getByTitle("The user's avatar");
    const senderNameDiv = screen.getByTitle("The name of the message's sender");
    const messageTimeDiv = screen.getByTitle(
      'The time at which the message was sent',
    );

    expect(chatAvatarDiv).toHaveStyle({
      width: '24px',
      height: '24px',
    });
    expect(senderNameDiv).toHaveTextContent('John Doe');
    expect(messageTimeDiv).toHaveTextContent('12:12');
  });
});