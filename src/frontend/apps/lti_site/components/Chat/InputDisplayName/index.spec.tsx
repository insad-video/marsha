import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { setLiveSessionDisplayName } from 'data/sideEffects/setLiveSessionDisplayName';
import { useJwt } from 'data/stores/useJwt';
import { useLiveSession } from 'data/stores/useLiveSession';
import {
  ANONYMOUS_ID_PREFIX,
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
} from 'default/chat';
import { DecodedJwt } from 'types/jwt';
import { liveSessionFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';
import { Nullable } from 'utils/types';
import { converse } from 'utils/window';

import { InputDisplayName } from '.';

jest.mock('utils/window', () => ({
  converse: {
    claimNewNicknameInChatRoom: jest.fn(),
  },
}));

jest.mock('data/sideEffects/setLiveSessionDisplayName', () => ({
  setLiveSessionDisplayName: jest.fn(),
}));

jest.mock('utils/checkLtiToken', () => ({
  checkLtiToken: jest.fn(),
}));

const mockConverse = converse.claimNewNicknameInChatRoom as jest.MockedFunction<
  typeof converse.claimNewNicknameInChatRoom
>;

const mockSetLiveSessionDisplayName =
  setLiveSessionDisplayName as jest.MockedFunction<
    typeof setLiveSessionDisplayName
  >;

describe('<InputDisplayName />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it(`controls input and shows error when input contains "${ANONYMOUS_ID_PREFIX}"`, async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');

    userEvent.type(inputTextbox, `${ANONYMOUS_ID_PREFIX}-John`);
    act(() => userEvent.click(validateButton));

    await screen.findByText(`Keyword "${ANONYMOUS_ID_PREFIX}" is not allowed.`);
    expect(
      screen.queryByText(`Min length is ${NICKNAME_MIN_LENGTH} characters.`),
    ).toBeNull();
    expect(
      screen.queryByText(`Max length is ${NICKNAME_MAX_LENGTH} characters.`),
    ).toBeNull();
    expect(inputTextbox).toHaveValue(`${ANONYMOUS_ID_PREFIX}-John`);
  });

  it(`controls input and shows error when input contains less than ${NICKNAME_MIN_LENGTH} characters.`, async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');

    userEvent.type(inputTextbox, 'JD');
    act(() => userEvent.click(validateButton));

    await screen.findByText(`Min length is ${NICKNAME_MIN_LENGTH} characters.`);
    expect(
      screen.queryByText(`Keyword "${ANONYMOUS_ID_PREFIX}" is not allowed.`),
    ).toBeNull();
    expect(
      screen.queryByText(`Max length is ${NICKNAME_MAX_LENGTH} characters.`),
    ).toBeNull();
    expect(inputTextbox).toHaveValue('JD');
  });

  it(`controls input and shows error when input contains more than ${NICKNAME_MAX_LENGTH} characters.`, async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');

    userEvent.type(inputTextbox, 'John Doe the legend');
    act(() => userEvent.click(validateButton));

    await screen.findByText(`Max length is ${NICKNAME_MAX_LENGTH} characters.`);
    expect(
      screen.queryByText(`Keyword "${ANONYMOUS_ID_PREFIX}" is not allowed.`),
    ).toBeNull();
    expect(
      screen.queryByText(`Min length is ${NICKNAME_MIN_LENGTH} characters.`),
    ).toBeNull();
    expect(inputTextbox).toHaveValue('John Doe the legend');
  });

  it('enters a valid nickname but the server takes too long to answer.', async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    mockConverse.mockImplementation(
      async (
        _displayName: string,
        _callbackSuccess: () => void,
        callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        await new Promise((r) => setTimeout(r, 2000));
        callbackError(null);
      },
    );
    mockSetLiveSessionDisplayName.mockResolvedValue({
      success: liveSessionFactory({ display_name: 'John_Doe' }),
    });
    expect(useLiveSession.getState().liveSession).toBeUndefined();

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.type(inputTextbox, 'John_Doe');
    expect(validateButton.querySelector('svg')).toBeTruthy();
    act(() => userEvent.click(validateButton));
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );
    expect(converse.claimNewNicknameInChatRoom).toHaveBeenCalledTimes(1);
    // When waiting prosody answer, svg button is replaced by a waiting spinner
    expect(validateButton.querySelector('svg')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(validateButton.querySelector('svg')).toBeTruthy();
    screen.getByText('The server took too long to respond. Please retry.');
  });

  it('enters a valid nickname but it is already used by a live registration', async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    mockConverse.mockImplementation(
      async (
        _displayName: string,
        _callbackSuccess: () => void,
        callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        await new Promise((r) => setTimeout(r, 2000));
        const parser = new DOMParser();
        callbackError(
          parser.parseFromString(
            '<error code="409" />',
            'text/xml',
          ) as any as HTMLElement,
        );
      },
    );
    mockSetLiveSessionDisplayName.mockResolvedValue({
      error: 409,
    });
    expect(useLiveSession.getState().liveSession).toBeUndefined();

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.type(inputTextbox, 'John_Doe');
    expect(validateButton.querySelector('svg')).toBeTruthy();
    act(() => userEvent.click(validateButton));
    // When waiting prosody answer, svg button is replaced by a waiting spinner
    expect(validateButton.querySelector('svg')).toBeNull();
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );
    expect(converse.claimNewNicknameInChatRoom).toHaveBeenCalledTimes(0);
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(validateButton.querySelector('svg')).toBeTruthy();
    screen.getByText(
      'Your nickname is already used in the chat. Please choose another one.',
    );
    expect(useLiveSession.getState().liveSession).toBeUndefined();
  });

  it('enters a valid nickname but it is already used in the chat', async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    mockConverse.mockImplementation(
      async (
        _displayName: string,
        _callbackSuccess: () => void,
        callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        await new Promise((r) => setTimeout(r, 2000));
        const parser = new DOMParser();
        callbackError(
          parser.parseFromString(
            '<error code="409" />',
            'text/xml',
          ) as any as HTMLElement,
        );
      },
    );
    mockSetLiveSessionDisplayName.mockResolvedValue({
      success: liveSessionFactory({ display_name: 'John_Doe' }),
    });
    expect(useLiveSession.getState().liveSession).toBeUndefined();

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.type(inputTextbox, 'John_Doe');
    expect(validateButton.querySelector('svg')).toBeTruthy();
    act(() => userEvent.click(validateButton));
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );
    expect(converse.claimNewNicknameInChatRoom).toHaveBeenCalledTimes(1);
    // When waiting prosody answer, svg button is replaced by a waiting spinner
    expect(validateButton.querySelector('svg')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(validateButton.querySelector('svg')).toBeTruthy();
    screen.getByText(
      'Your nickname is already used in the chat. Please choose another one.',
    );
    expect(useLiveSession.getState().liveSession).toBeUndefined();
  });

  it('enters a valid nickname but the server returns an unknown response', async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    mockConverse.mockImplementation(
      async (
        _displayName: string,
        _callbackSuccess: () => void,
        callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        await new Promise((r) => setTimeout(r, 2000));
        const parser = new DOMParser();
        callbackError(
          parser.parseFromString(
            '<unknownStanza unknownAttribute="unrecognizedValue" />',
            'text/xml',
          ) as any as HTMLElement,
        );
      },
    );
    mockSetLiveSessionDisplayName.mockResolvedValue({
      success: liveSessionFactory({ display_name: 'John_Doe' }),
    });
    expect(useLiveSession.getState().liveSession).toBeUndefined();

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.type(inputTextbox, 'John_Doe');
    expect(validateButton.querySelector('svg')).toBeTruthy();
    act(() => userEvent.click(validateButton));
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );
    expect(converse.claimNewNicknameInChatRoom).toHaveBeenCalledTimes(1);
    // When waiting prosody answer, svg button is replaced by a waiting spinner
    expect(validateButton.querySelector('svg')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(validateButton.querySelector('svg')).toBeTruthy();
    screen.getByText('Impossible to connect you to the chat. Please retry.');
    expect(useLiveSession.getState().liveSession).toBeUndefined();
  });

  it('enters a valid nickname and validates it.', async () => {
    useJwt.setState({
      getDecodedJwt: () => ({} as DecodedJwt),
    });

    mockConverse.mockImplementation(
      async (
        _displayName: string,
        callbackSuccess: () => void,
        _callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        callbackSuccess();
      },
    );
    const liveSession = liveSessionFactory({
      display_name: 'John_Doe',
    });
    mockSetLiveSessionDisplayName.mockResolvedValue({
      success: liveSession,
    });
    expect(useLiveSession.getState().liveSession).toBeUndefined();

    render(<InputDisplayName />);

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.type(inputTextbox, 'John_Doe');
    act(() => userEvent.click(validateButton));
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );

    expect(converse.claimNewNicknameInChatRoom).toHaveBeenNthCalledWith(
      1,
      'John_Doe',
      expect.any(Function),
      expect.any(Function),
    );
    expect(converse.claimNewNicknameInChatRoom).toHaveBeenCalledTimes(1);
    expect(useLiveSession.getState().liveSession).toEqual(liveSession);
  });

  it('displays the component and use liveSession username as default value', () => {
    useJwt.setState({
      getDecodedJwt: () =>
        ({
          user: {
            id: '7f93178b-e578-44a6-8c85-ef267b6bf431',
            username: 'jane_doe',
          },
        } as DecodedJwt),
    });

    const liveSession = liveSessionFactory({ username: 'Foo' });
    useLiveSession.getState().setLiveSession(liveSession);

    render(<InputDisplayName />);

    expect(screen.getByRole('textbox')).toHaveValue('Foo');
  });

  it('displays the component and use jwt display_name as default value', () => {
    useJwt.setState({
      getDecodedJwt: () =>
        ({
          user: {
            id: '7f93178b-e578-44a6-8c85-ef267b6bf431',
            username: 'jane_doe',
          },
        } as DecodedJwt),
    });

    render(<InputDisplayName />);

    expect(screen.getByRole('textbox')).toHaveValue('jane_doe');
  });
});