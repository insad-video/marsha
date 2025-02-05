import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import {
  useJwt,
  sharedLiveMediaMockFactory,
  useSharedLiveMedia,
  report,
} from 'lib-components';
import { render } from 'lib-tests';
import React from 'react';

import { useDeleteSharedLiveMediaModal } from 'hooks/useDeleteSharedLiveMediaModal';

import { SharedLiveMediaModalWrapper } from '.';

jest.mock('lib-components', () => ({
  ...jest.requireActual('lib-components'),
  report: jest.fn(),
}));

jest.mock('hooks/useDeleteSharedLiveMediaModal', () => ({
  useDeleteSharedLiveMediaModal: jest.fn(),
}));

const mockUseDeleteSharedLiveMediaModal =
  useDeleteSharedLiveMediaModal as jest.MockedFunction<
    typeof useDeleteSharedLiveMediaModal
  >;

describe('<SharedLiveMediaModalWrapper />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'json web token',
    });

    jest.resetAllMocks();
  });

  it('renders nothing if there is no shared live media to delete', () => {
    mockUseDeleteSharedLiveMediaModal.mockReturnValue([null, jest.fn()]);
    render(<SharedLiveMediaModalWrapper />);
    expect(screen.queryByText('Delete shared media')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirm' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('renders the modal when there is a shared live media to delete, and clicks on cancel', () => {
    const mockedSharedLiveMedia = sharedLiveMediaMockFactory();
    const mockSetDeleteSharedLiveMediaModal = jest.fn();
    mockUseDeleteSharedLiveMediaModal.mockReturnValue([
      mockedSharedLiveMedia,
      mockSetDeleteSharedLiveMediaModal,
    ]);
    render(<SharedLiveMediaModalWrapper />);
    screen.getByText('Delete shared media');
    screen.getByText(
      `Are you sure you want to delete file ${
        mockedSharedLiveMedia.title ?? ''
      } ?`,
    );
    screen.getByRole('button', { name: 'Confirm' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    userEvent.click(cancelButton);

    expect(mockSetDeleteSharedLiveMediaModal).toHaveBeenCalledTimes(1);
    expect(mockSetDeleteSharedLiveMediaModal).toHaveBeenCalledWith(null);
  });

  it('renders the modal when there is a shared live media to delete, and clicks on confirm', async () => {
    const mockedSharedLiveMedia = sharedLiveMediaMockFactory();
    mockUseDeleteSharedLiveMediaModal.mockReturnValue([
      mockedSharedLiveMedia,
      jest.fn(),
    ]);
    fetchMock.delete(`/api/sharedlivemedias/${mockedSharedLiveMedia.id}/`, 204);
    const mockRemoveResource = jest.fn();
    useSharedLiveMedia.getState().removeResource = mockRemoveResource;

    render(<SharedLiveMediaModalWrapper />);
    screen.getByText('Delete shared media');
    screen.getByText(
      `Are you sure you want to delete file ${
        mockedSharedLiveMedia.title ?? ''
      } ?`,
    );
    screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    userEvent.click(confirmButton);

    await waitFor(() =>
      expect(fetchMock.lastCall()![0]).toEqual(
        `/api/sharedlivemedias/${mockedSharedLiveMedia.id}/`,
      ),
    );
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    screen.getByText('Shared media deleted.');
    expect(mockRemoveResource).toHaveBeenCalledWith(mockedSharedLiveMedia);
    expect(report).not.toHaveBeenCalled();
  });

  it('renders the modal when there is a shared live media to delete, and clicks on confirm, but it fails', async () => {
    const mockedSharedLiveMedia = sharedLiveMediaMockFactory();
    mockUseDeleteSharedLiveMediaModal.mockReturnValue([
      mockedSharedLiveMedia,
      jest.fn(),
    ]);
    fetchMock.delete(`/api/sharedlivemedias/${mockedSharedLiveMedia.id}/`, 500);
    const mockRemoveResource = jest.fn();
    useSharedLiveMedia.getState().removeResource = mockRemoveResource;

    render(<SharedLiveMediaModalWrapper />);
    screen.getByText('Delete shared media');
    screen.getByText(
      `Are you sure you want to delete file ${
        mockedSharedLiveMedia.title ?? ''
      } ?`,
    );
    screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    userEvent.click(confirmButton);

    await waitFor(() =>
      expect(fetchMock.lastCall()![0]).toEqual(
        `/api/sharedlivemedias/${mockedSharedLiveMedia.id}/`,
      ),
    );
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    screen.getByText('Shared media deletion has failed !');
    expect(mockRemoveResource).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalled();
  });
});
