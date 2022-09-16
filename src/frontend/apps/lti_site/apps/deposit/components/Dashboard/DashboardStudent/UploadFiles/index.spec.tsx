import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';

import {
  UploadManagerStatus,
  useUploadManager,
} from 'components/UploadManager';
import { Deferred } from 'utils/tests/Deferred';
import render from 'utils/tests/render';
import { uploadState } from 'types/tracks';

import { createDepositedFile } from 'apps/deposit/data/sideEffects/createDepositedFile';
import { DepositedFile, modelName } from 'apps/deposit/types/models';
import { depositedFileMockFactory } from 'apps/deposit/utils/tests/factories';

import { UploadFiles } from '.';

jest.mock('data/stores/useAppConfig', () => ({ useAppConfig: () => ({}) }));

jest.mock('apps/deposit/data/depositAppData', () => ({
  depositAppData: {
    modelName: 'file_depositories',
    fileDepository: {
      id: '1',
    },
    jwt: 'token',
  },
}));

jest.mock('components/UploadManager', () => ({
  useUploadManager: jest.fn(),
  UploadManagerContext: {
    Provider: ({ children }: PropsWithChildren<{}>) => children,
  },
  UploadManagerStatus: jest.requireActual('components/UploadManager')
    .UploadManagerStatus,
}));
const mockUseUploadManager = useUploadManager as jest.MockedFunction<
  typeof useUploadManager
>;

mockUseUploadManager.mockReturnValue({
  addUpload: jest.fn(),
  resetUpload: jest.fn(),
  uploadManagerState: {},
});

jest.mock('apps/deposit/data/sideEffects/createDepositedFile', () => ({
  createDepositedFile: jest.fn(),
}));
const mockCreateDepositedFile = createDepositedFile as jest.MockedFunction<
  typeof createDepositedFile
>;

const { PENDING } = uploadState;

describe('<UploadFiles />', () => {
  it('renders a Dropzone with the relevant messages', () => {
    render(<UploadFiles />);
    screen.getByText("Drag 'n' drop some files here, or click to select files");
  });

  it('passes the file to the callback', async () => {
    const createDeferred = new Deferred<DepositedFile>();
    mockCreateDepositedFile.mockReturnValue(createDeferred.promise);

    const mockAddUpload = jest.fn();
    mockUseUploadManager.mockReturnValue({
      addUpload: mockAddUpload,
      resetUpload: jest.fn(),
      uploadManagerState: {},
    });

    const { container } = render(<UploadFiles />);

    const file = new File(['(⌐□_□)'], 'course.mp4', { type: 'video/mp4' });
    await act(async () => {
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [file],
        },
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    const depositedFile = depositedFileMockFactory();
    createDeferred.resolve(depositedFile);

    await waitFor(() => expect(expect(mockAddUpload).toHaveBeenCalledTimes(1)));
    expect(mockAddUpload).toHaveBeenLastCalledWith(
      modelName.DepositedFiles,
      depositedFile.id,
      file,
    );
  });

  it('shows the upload progress when the file is uploading', async () => {
    const file = new File(['(⌐□_□)'], 'course.mp4', { type: 'video/mp4' });
    const depositedFile = depositedFileMockFactory({
      upload_state: PENDING,
    });

    mockUseUploadManager.mockReturnValue({
      addUpload: jest.fn(),
      resetUpload: jest.fn(),
      uploadManagerState: {
        [depositedFile.id]: {
          file,
          objectType: modelName.DepositedFiles,
          objectId: depositedFile.id,
          progress: 20,
          status: UploadManagerStatus.UPLOADING,
        },
      },
    });
    render(<UploadFiles />);

    await screen.findByText('20%');
    await screen.findByText(
      'Upload in progress... Please do not close or reload this page.',
    );
  });
});