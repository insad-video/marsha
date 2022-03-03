import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Button } from 'components/Button';
import { ChatSVG } from 'components/SVGIcons/ChatSVG';
import {
  LivePanelItem,
  useLivePanelState,
} from 'data/stores/useLivePanelState';

const messages = defineMessages({
  chat: {
    defaultMessage: 'Chat',
    description: 'Label for the chat button',
    id: 'components.StudentShowChatButton.Chat',
  },
  showChat: {
    defaultMessage: 'Show chat',
    description: 'Title for the chat button',
    id: 'components.StudentShowChatButton.showChat',
  },
});

export const StudentShowChatButton = () => {
  const intl = useIntl();
  const { setPanelVisibility } = useLivePanelState((state) => ({
    setPanelVisibility: state.setPanelVisibility,
  }));

  return (
    <Button
      label={intl.formatMessage(messages.chat)}
      Icon={ChatSVG}
      onClick={() => {
        setPanelVisibility(true, LivePanelItem.CHAT);
      }}
      title={intl.formatMessage(messages.showChat)}
    />
  );
};