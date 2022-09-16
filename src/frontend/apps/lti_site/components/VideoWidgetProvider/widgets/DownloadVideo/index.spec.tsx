import { within } from '@testing-library/dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { PropsWithChildren } from 'react';

import { InfoWidgetModalProvider } from 'data/stores/useInfoWidgetModal';
import { useJwt } from 'data/stores/useJwt';
import { videoMockFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';
import { wrapInVideo } from 'utils/tests/wrapInVideo';
import { DownloadVideo } from '.';
import fetchMock from 'fetch-mock';

const mockSetInfoWidgetModal = jest.fn();
jest.mock('data/stores/useInfoWidgetModal', () => ({
  useInfoWidgetModal: () => [
    { isVisible: false, text: null, title: null },
    mockSetInfoWidgetModal,
  ],
  InfoWidgetModalProvider: ({ children }: PropsWithChildren<{}>) => children,
}));

jest.mock('utils/errors/report', () => ({
  report: jest.fn(),
}));

describe('<InstructorDownloadVideo />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'json web token',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the component', () => {
    const mockedVideo = videoMockFactory();
    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('Download video');
    act(() => userEvent.click(screen.getByRole('button', { name: 'help' })));
    expect(mockSetInfoWidgetModal).toHaveBeenCalledWith({
      title: 'Download video',
      text: 'This widget allows you to download the video, with the available quality you desire.',
    });

    const button = screen.getByRole('button', {
      name: 'This input allows you to select the quality you desire for your download.; Selected: 1080 p',
    });
    within(button).getByText('1080 p');

    screen.getByRole('link', { name: 'Download' });
  });

  it('selects the lowest quality', () => {
    const mockedVideo = videoMockFactory();

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const defaultButtonSelect = screen.getByRole('button', {
      name: 'This input allows you to select the quality you desire for your download.; Selected: 1080 p',
    });

    act(() => userEvent.click(defaultButtonSelect));

    const lowestQualityButtonSelect = screen.getByRole('option', {
      name: '144 p',
    });
    act(() => userEvent.click(lowestQualityButtonSelect));

    expect(screen.queryByText('240 p')).toBe(null);
    expect(screen.queryByText('720 p')).toBe(null);
    expect(screen.queryByText('1080 p')).toBe(null);

    screen.getByText('144 p');
  });

  it('downloads the video with the default selected quality', () => {
    const mockedVideo = videoMockFactory();

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('1080 p');
    const downloadButton = screen.getByRole('link', { name: 'Download' });
    expect(downloadButton).toHaveAttribute(
      'href',
      'https://example.com/mp4/1080',
    );
    userEvent.click(downloadButton);
  });

  it("renders the component when there aren't any resolutions available", () => {
    const mockedVideo = videoMockFactory({ urls: null });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('No resolutions available');
    const downloadButton = screen.getByRole('button', { name: 'Download' });
    expect(downloadButton).toBeDisabled();
  });

  it('check toggle allow download disable attribute', async () => {
    const mockedVideo = videoMockFactory();
    const allowDownloadToggleLabel = 'Allow video download';
    const allowDownloadToggleFail = 'Update failed, try again.';

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const allowDownloadToggle = screen.getByRole('checkbox', {
      name: allowDownloadToggleLabel,
    });

    userEvent.click(allowDownloadToggle);

    await waitFor(() => {
      expect(allowDownloadToggle).toBeDisabled();
    });

    await screen.findByText(allowDownloadToggleFail);

    expect(allowDownloadToggle).not.toBeDisabled();
  });

  it('check toggle allow download with failed update', async () => {
    const mockedVideo = videoMockFactory();
    const allowDownloadToggleLabel = 'Allow video download';
    const allowDownloadToggleFail = 'Update failed, try again.';

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const allowDownloadToggle = screen.getByRole('checkbox', {
      name: allowDownloadToggleLabel,
    });

    expect(screen.queryByText(allowDownloadToggleFail)).not.toBeInTheDocument();

    userEvent.click(allowDownloadToggle);

    await screen.findByText(allowDownloadToggleFail);
  });

  it('check toggle allow download with succeded update and allowed download', async () => {
    const mockedVideo = videoMockFactory({
      show_download: false,
    });
    const allowDownloadToggleLabel = 'Allow video download';
    const allowDownloadToggleSuccess = 'Video download allowed.';

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      show_download: true,
    });

    const allowDownloadToggle = screen.getByRole('checkbox', {
      name: allowDownloadToggleLabel,
    });

    expect(
      screen.queryByText(allowDownloadToggleSuccess),
    ).not.toBeInTheDocument();

    userEvent.click(allowDownloadToggle);

    await screen.findByText(allowDownloadToggleSuccess);

    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer json web token',
      },
      method: 'PATCH',
      body: '{"show_download":true}',
    });
  });

  it('check toggle allow download with succeded update and disallowed download', async () => {
    const mockedVideo = videoMockFactory();
    const allowDownloadToggleLabel = 'Allow video download';
    const disallowDownloadToggleSuccess = 'Video download disallowed.';

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <DownloadVideo />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      show_download: false,
    });

    const allowDownloadToggle = screen.getByRole('checkbox', {
      name: allowDownloadToggleLabel,
    });

    expect(
      screen.queryByText(disallowDownloadToggleSuccess),
    ).not.toBeInTheDocument();

    userEvent.click(allowDownloadToggle);

    await screen.findByText(disallowDownloadToggleSuccess);

    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer json web token',
      },
      method: 'PATCH',
      body: '{"show_download":false}',
    });
  });
});