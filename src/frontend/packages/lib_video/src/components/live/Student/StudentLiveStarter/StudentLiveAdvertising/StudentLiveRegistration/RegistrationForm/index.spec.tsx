import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchMediaMock from 'jest-matchmedia-mock';
import { decodeJwt, liveSessionFactory, liveMockFactory } from 'lib-components';
import { render } from 'lib-tests';
import React from 'react';

import { createLiveSession } from 'api/createLiveSession';
import { updateLiveSession } from 'api/updateLiveSession';
import { wrapInVideo } from 'utils/wrapInVideo';

import { RegistrationForm } from '.';

const setRegistrationCompleted = jest.fn();

let matchMedia: MatchMediaMock;

jest.mock('api/createLiveSession', () => ({
  createLiveSession: jest.fn(),
}));
const mockCreateLiveSession = createLiveSession as jest.MockedFunction<
  typeof createLiveSession
>;

jest.mock('api/updateLiveSession', () => ({
  updateLiveSession: jest.fn(),
}));
const mockUpdateLiveSession = updateLiveSession as jest.MockedFunction<
  typeof updateLiveSession
>;

jest.mock('lib-components', () => ({
  ...jest.requireActual('lib-components'),
  decodeJwt: jest.fn(),
}));
const mockedDecodeJwt = decodeJwt as jest.MockedFunction<typeof decodeJwt>;

const live = liveMockFactory({
  id: 'some-live-id',
});

describe('<RegistrationForm />', () => {
  beforeEach(() => {
    matchMedia = new MatchMediaMock();
    jest.clearAllMocks();

    mockedDecodeJwt.mockReturnValue({
      consumer_site: 'consumer_site',
      locale: 'en',
      maintenance: false,
      permissions: {
        can_access_dashboard: false,
        can_update: false,
      },
      resource_id: 'resource id',
      roles: ['student'],
      session_id: 'session id',
      user: {
        id: 'user_id',
        email: 'some email',
        username: 'user name',
        user_fullname: 'user full name',
      },
    });
  });

  afterEach(() => {
    matchMedia.clear();
  });

  it('renders the form without values', () => {
    render(
      wrapInVideo(
        <RegistrationForm
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    const textbox = screen.getByRole('textbox', { name: 'Email address' });
    screen.getByRole('button', { name: 'Register' });
    expect(
      screen.queryByText('You have to submit a valid email to register.'),
    ).not.toBeInTheDocument();

    const email = 'test_email@openfun.fr';
    userEvent.type(textbox, email);

    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveValue(email);
  });

  it('renders the form with initial value', () => {
    render(
      wrapInVideo(
        <RegistrationForm
          defaultEmail="some.email@openfun.fr"
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    screen.getByRole('textbox', { name: 'Email address' });
    screen.getByDisplayValue('some.email@openfun.fr');
    screen.getByRole('button', { name: 'Register' });
    expect(
      screen.queryByText('You have to submit a valid email to register.'),
    ).not.toBeInTheDocument();
  });

  it('hides the field for lti user with email', async () => {
    mockedDecodeJwt.mockReturnValue({
      consumer_site: 'consumer site',
      context_id: 'context id',
      locale: 'en',
      maintenance: false,
      permissions: {
        can_access_dashboard: false,
        can_update: false,
      },
      resource_id: 'resource id',
      roles: ['student'],
      session_id: 'session id',
      user: {
        id: 'user_id',
        email: 'some email',
        username: 'user name',
        user_fullname: 'user full name',
      },
    });
    mockCreateLiveSession.mockResolvedValue(Promise.reject('some error'));

    render(
      wrapInVideo(
        <RegistrationForm
          defaultEmail="some.email@openfun.fr"
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    expect(
      screen.queryByRole('textbox', { name: 'Email address' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Impossible to register your email some.email@openfun.fr for this event. Make sure your email is valid otherwise, please try again later or contact us.',
      ),
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await screen.findByText(
      'Impossible to register your email some.email@openfun.fr for this event. Make sure your email is valid otherwise, please try again later or contact us.',
    );

    const liveSession = liveSessionFactory({
      id: 'id',
      email: 'email',
      should_send_reminders: true,
      video: 'id',
    });
    mockCreateLiveSession.mockResolvedValue(liveSession);

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() =>
      expect(setRegistrationCompleted).toHaveBeenCalledTimes(1),
    );

    expect(
      screen.queryByText(
        'Impossible to register your email some.email@openfun.fr for this event. Make sure your email is valid otherwise, please try again later or contact us.',
      ),
    ).not.toBeInTheDocument();
  });

  it('calls parent on submit success', async () => {
    const liveSession = liveSessionFactory({
      id: 'id',
      email: 'email',
      should_send_reminders: true,
      video: live.id,
    });
    mockCreateLiveSession.mockResolvedValue(liveSession);

    render(
      wrapInVideo(
        <RegistrationForm
          defaultEmail="some.email@openfun.com"
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    expect(mockCreateLiveSession).toHaveBeenCalledTimes(0);
    expect(setRegistrationCompleted).toHaveBeenCalledTimes(0);

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => expect(mockCreateLiveSession).toHaveBeenCalledTimes(1));
    expect(setRegistrationCompleted).toHaveBeenCalledTimes(1);
  });

  it('renders the error when email is invalid', async () => {
    render(
      wrapInVideo(
        <RegistrationForm
          defaultEmail="some.invalid.email@openfun."
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    screen.getByRole('textbox', { name: 'Email address' });
    screen.getByDisplayValue('some.invalid.email@openfun.');
    expect(
      screen.queryByText('You have to submit a valid email to register.'),
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await screen.findByText('You have to submit a valid email to register.');
  });

  it('renders an error when validation fail server side', async () => {
    mockCreateLiveSession.mockResolvedValue(Promise.reject('some error'));

    render(
      wrapInVideo(
        <RegistrationForm
          defaultEmail="some.email@openfun.fr"
          liveSession={undefined}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );

    screen.getByRole('textbox', { name: 'Email address' });
    screen.getByDisplayValue('some.email@openfun.fr');
    expect(
      screen.queryByText('You have to submit a valid email to register.'),
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await screen.findByText(
      'Impossible to register your email some.email@openfun.fr for this event. Make sure your email is valid otherwise, please try again later or contact us.',
    );
  });
  it('updates the live session when this one is set in the props', async () => {
    const existingLiveSession = liveSessionFactory({
      is_registered: false,
      email: 'to_update@fun-test.fr',
    });

    render(
      wrapInVideo(
        <RegistrationForm
          liveSession={existingLiveSession}
          setRegistrationCompleted={setRegistrationCompleted}
        />,
        live,
      ),
    );
    const updatedEmail = 'updatedEmail@fun-test.fr';
    const textbox = screen.getByRole('textbox', { name: 'Email address' });

    userEvent.type(textbox, updatedEmail);

    userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockUpdateLiveSession).toHaveBeenCalledWith(
        existingLiveSession,
        'en',
        updatedEmail,
        true,
        expect.anything(),
      );
    });
  });
});
