import { Box, Button, Grid, Paragraph, Text } from 'grommet';
import Dropzone from 'react-dropzone';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import { PlusSVG } from 'lib-components';
import { UploadableObjectProgress } from 'components/UploadableObjectProgress';
import {
  UploadManagerStatus,
  useUploadManager,
} from 'components/UploadManager';

import { depositAppData } from 'apps/deposit/data/depositAppData';
import { useDepositedFiles } from 'apps/deposit/data/queries';
import { createDepositedFile } from 'apps/deposit/data/sideEffects/createDepositedFile';
import { modelName } from 'apps/deposit/types/models';
import { bytesToSize } from 'apps/deposit/utils/bytesToSize';
import { truncateFilename } from 'apps/deposit/utils/truncateFilename';

const messages = defineMessages({
  dropzonePlaceholder: {
    defaultMessage: "Drag 'n' drop some files here, or click to select files",
    description: 'Placeholder for dropzone.',
    id: 'apps.deposit.components.DashboardStudent.UploadFiles.dropzonePlaceholder',
  },
  uploadButtonLabel: {
    defaultMessage: 'Upload',
    description: 'Label for upload button.',
    id: 'apps.deposit.components.DashboardStudent.UploadFiles.uploadButtonLabel',
  },
  uploadingFile: {
    defaultMessage:
      'Upload in progress... Please do not close or reload this page.',
    description:
      'Help text to warn user not to navigate away during file upload.',
    id: 'apps.deposit.components.DashboardStudent.UploadFiles.uploadingFile',
  },
});

export const UploadFiles = () => {
  const intl = useIntl();
  const { refetch: refreshDepositedFiles } = useDepositedFiles(
    depositAppData.fileDepository!.id,
    {},
  );

  const { addUpload, uploadManagerState } = useUploadManager();
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadsInProgress = Object.values(uploadManagerState).filter((state) =>
    [UploadManagerStatus.INIT, UploadManagerStatus.UPLOADING].includes(
      state.status,
    ),
  );
  const uploadsSucceeded = Object.values(uploadManagerState).filter((state) =>
    [UploadManagerStatus.SUCCESS].includes(state.status),
  );

  const onDrop = (files: any) => {
    setFilesToUpload(filesToUpload.concat(files));
  };

  const uploadFiles = () => {
    const file = filesToUpload.shift();
    if (!file) {
      return;
    }

    setUploading(true);
    createDepositedFile({
      size: file.size,
      filename: file.name,
    }).then((response) => {
      addUpload(modelName.DepositedFiles, response.id, file);
      refreshDepositedFiles();
    });
  };

  useEffect(() => {
    if (uploading) {
      if (filesToUpload.length > 0) {
        uploadFiles();
      } else {
        setUploading(false);
      }
    }
  }, [uploadsSucceeded.length]);

  return (
    <Box>
      <Box
        align="center"
        background="blue-message"
        fill
        border={{
          style: filesToUpload.length === 0 ? 'dashed' : 'solid',
          size: 'small',
          color: 'blue-active',
        }}
        margin={{ bottom: 'large' }}
        round="small"
      >
        {uploadsInProgress.length > 0 && (
          <Box fill>
            {uploadsInProgress.map((state) => (
              <Box
                key={state.objectId}
                fill
                background="#F9FBFD"
                pad="large"
                align="center"
                margin={{ bottom: 'xsmall' }}
              >
                <Text weight="bold">
                  {truncateFilename(state.file.name, 40)}
                </Text>
                <UploadableObjectProgress objectId={state.objectId} />
                {intl.formatMessage(messages.uploadingFile)}
              </Box>
            ))}
          </Box>
        )}
        {filesToUpload.length !== 0 && (
          <Box fill>
            {filesToUpload.map((file) => (
              <Box
                key={file.name}
                direction="row"
                fill
                background="#F9FBFD"
                pad="large"
                align="center"
                margin={{ bottom: 'xsmall' }}
              >
                <Grid columns={{ count: 3, size: 'small' }} fill>
                  <Box justify="start">
                    <Text weight="bold">{truncateFilename(file.name, 40)}</Text>
                  </Box>
                  <Box justify="center">
                    <Text alignSelf="center">{bytesToSize(file.size)}</Text>
                  </Box>
                  <Box justify="end">
                    <Text alignSelf="end">
                      {DateTime.now().toFormat('dd/MM/yyyy')}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            ))}
          </Box>
        )}
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <Box pad="large">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Box
                  direction={filesToUpload.length === 0 ? 'column' : 'row'}
                  align="center"
                  gap="medium"
                >
                  {filesToUpload.length === 0 ? (
                    <PlusSVG iconColor="#75A7E5" height="100px" width="100px" />
                  ) : (
                    <PlusSVG iconColor="#75A7E5" height="45px" width="45px" />
                  )}
                  <Paragraph color="#75A7E5" textAlign="center" margin="none">
                    <FormattedMessage {...messages.dropzonePlaceholder} />
                  </Paragraph>
                </Box>
              </div>
            </Box>
          )}
        </Dropzone>
      </Box>

      <Button
        primary
        onClick={uploadFiles}
        label={intl.formatMessage(messages.uploadButtonLabel)}
        color="blue-active"
        margin={{ bottom: 'large' }}
        disabled={filesToUpload.length === 0}
      />
    </Box>
  );
};