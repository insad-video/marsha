import { Box, Text, Tip } from 'grommet';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { InputBar } from 'components/Chat/SharedChatComponents/InputBar';
import { ExitCrossSVG } from 'components/SVGIcons/ExitCrossSVG';
import { QuestionMarkSVG } from 'components/SVGIcons/QuestionMarkSVG';
import {
  ANONYMOUS_ID_PREFIX,
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from 'default/chat';
import { converse } from 'utils/window';
import { InputDisplayNameIncorrectAlert } from './InputDisplayNameIncorrectAlert/index';

const messages = defineMessages({
  closeButtonTitle: {
    defaultMessage: 'Click this button to close the overlay.',
    description: 'A title describing the close button action',
    id: 'components.InputDiplayNameOverlay.closeButtonTitle',
  },
  inputAnonymousKeywordForbiddenAlertMessage: {
    defaultMessage: 'Keyword "{forbiddenPrefix}" is not allowed.',
    description:
      'An alert message explaining why the entered display name is invalid.',
    id: 'components.InputDisplayNameOverlay.inputAnonymousKeywordForbiddenAlertMessage',
  },
  inputDisplayNameInformative: {
    defaultMessage:
      "The display name is the pseudonym you will be authenticated with on this live. You won't be able to change it during the live. Other participants will see you with this name. The instructor will however be able to see your genuine identity if you have previously identified yourself with the LTI.",
    description:
      'An informative text about the display name which is asked to enter.',
    id: 'components.InputDisplayNameOverlay.inputDisplayNameInformative',
  },
  inputDisplayNameLabel: {
    defaultMessage: 'Display name',
    description: 'An label describing the input below.',
    id: 'components.InputDisplayNameOverlay.inputDisplayNameLabel',
  },
  inputDisplayNamePlaceholder: {
    defaultMessage: 'Enter your desired display name...',
    description: 'The input bar to fill your display name.',
    id: 'components.InputBar.inputDisplayNamePlaceholder',
  },
  inputTooShortAlertMessage: {
    defaultMessage: 'Min length is {minLength} characters.',
    description:
      'An alert message explaining why the entered display name is invalid.',
    id: 'components.InputDisplayNameOverlay.inputTooShortAlertMessage',
  },
  inputTooLongAlertMessage: {
    defaultMessage: 'Max length is {maxLength} characters.',
    description:
      'An alert message explaining why the entered display name is invalid.',
    id: 'components.InputDisplayNameOverlay.inputTooLongAlertMessage',
  },
});

interface InputDisplayNameOverlayProps {
  setInputBarActive: React.Dispatch<React.SetStateAction<boolean>>;
  setOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InputDisplayNameOverlay = ({
  setInputBarActive,
  setOverlay,
}: InputDisplayNameOverlayProps) => {
  const intl = useIntl();
  const [alertsState, setAlertsState] = useState<string[]>([]);

  const processDisplayName = (displayName: string) => {
    const alerts: string[] = [];
    if (displayName.toLowerCase().includes(ANONYMOUS_ID_PREFIX)) {
      alerts.push(
        intl.formatMessage(
          messages.inputAnonymousKeywordForbiddenAlertMessage,
          { forbiddenPrefix: ANONYMOUS_ID_PREFIX },
        ),
      );
    }
    if (displayName.length < NICKNAME_MIN_LENGTH) {
      alerts.push(
        intl.formatMessage(messages.inputTooShortAlertMessage, {
          minLength: NICKNAME_MIN_LENGTH,
        }),
      );
    }
    if (displayName.length > NICKNAME_MAX_LENGTH) {
      alerts.push(
        intl.formatMessage(messages.inputTooLongAlertMessage, {
          maxLength: NICKNAME_MAX_LENGTH,
        }),
      );
    }
    if (alerts.length === 0) {
      converse.claimNewNicknameInChatRoom(displayName);
      setInputBarActive(true);
      setOverlay(false);
      return true;
    } else {
      setAlertsState(alerts);
      return false;
    }
  };

  const handleExitCrossClick = () => {
    setOverlay(false);
  };

  return (
    <Box height="100%">
      <Box
        direction="row-reverse"
        margin={{
          right: '5px',
          top: '5px',
        }}
      >
        <Box
          onClick={handleExitCrossClick}
          title={intl.formatMessage(messages.closeButtonTitle)}
        >
          <ExitCrossSVG
            containerStyle={{
              height: '20px',
              width: '20px',
            }}
            iconColor="#031963"
          />
        </Box>
      </Box>
      <Box
        margin={{
          horizontal: '20px',
          vertical: '30px',
        }}
        pad="3px"
      >
        <Box background="#edf5fa" gap="8px" pad="8px" round="6px">
          <Box direction="row">
            <Text
              margin={{
                right: '5px',
              }}
              size="0.875rem"
            >
              {intl.formatMessage(messages.inputDisplayNameLabel)}
            </Text>
            <Box>
              <Tip
                content={
                  <Box background="#ffffff" pad="2px" round="6px" width="150px">
                    <Text size="0.625rem">
                      {intl.formatMessage(messages.inputDisplayNameInformative)}
                    </Text>
                  </Box>
                }
                plain
              >
                <Box>
                  <QuestionMarkSVG
                    containerStyle={{
                      height: '15px',
                      width: '15px',
                    }}
                    iconColor="#031963"
                  />
                </Box>
              </Tip>
            </Box>
          </Box>
          <InputBar
            handleUserInput={processDisplayName}
            isChatInput={false}
            placeholderText={intl.formatMessage(
              messages.inputDisplayNamePlaceholder,
            )}
          />
        </Box>
        <Box>
          {alertsState.map((msg, index) => (
            <InputDisplayNameIncorrectAlert alertMsg={msg} key={index} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};