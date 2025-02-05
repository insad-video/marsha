import { MarkdownImageProgressToast } from 'components/MarkdownImageProgressToast';
import { createMarkdownImage, pollForMarkdownImage } from 'data';
import {
  UploadManagerStatus,
  useUploadManager,
  MarkdownDocumentModelName as modelName,
} from 'lib-components';
import React, { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  uploaded: {
    defaultMessage: 'Uploaded {imageName}',
    description: 'Displayed in Markdown image upload status',
    id: 'component.useImageUploadManager.uploaded',
  },
  processing: {
    defaultMessage: 'Processing {imageName}',
    description: 'Displayed in Markdown image upload status',
    id: 'component.useImageUploadManager.processing',
  },
  error: {
    defaultMessage: 'Error while uploading {imageName}: {error}',
    description: 'Displayed in Markdown image upload status',
    id: 'component.useImageUploadManager.error',
  },
});

const toasterStyle = {
  minWidth: '50%',
};

export const useImageUploadManager = (
  onImageUploadFinished: (imageId: string, imageFileName: string) => void,
) => {
  const intl = useIntl();
  const { addUpload, uploadManagerState, resetUpload } = useUploadManager();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Object.entries(uploadManagerState).forEach(async (entry) => {
      const [imageId, uploadingObject] = entry;

      if (uploadingObject.status === UploadManagerStatus.UPLOADING) {
        toast.loading(
          <MarkdownImageProgressToast
            filename={uploadingObject.file.name}
            progress={uploadingObject.progress}
          />,
          { id: imageId, style: toasterStyle, duration: Infinity },
        );
      } else if (uploadingObject.status === UploadManagerStatus.SUCCESS) {
        // Once the update is done, the file will be processed, we have to wait for the processing
        // to be done too, hence the polling.
        await toast.promise(
          pollForMarkdownImage(imageId),
          {
            loading: intl.formatMessage(messages.processing, {
              imageName: uploadingObject.file.name,
            }),
            success: () => {
              onImageUploadFinished(imageId, uploadingObject.file.name);
              return intl.formatMessage(messages.uploaded, {
                imageName: uploadingObject.file.name,
              });
            },
            error: (err: Error) =>
              intl.formatMessage(messages.error, {
                imageName: uploadingObject.file.name,
                error: err.toString(),
              }),
          },
          {
            id: imageId,
            style: toasterStyle,
            loading: { duration: Infinity },
            success: { duration: 1000 },
            error: { duration: 2000 },
          },
        );
        resetUpload(imageId);
      }
    });
  }, [intl, onImageUploadFinished, resetUpload, uploadManagerState]);

  const addImageUpload = useCallback(
    async (file: File) => {
      const response = await createMarkdownImage();
      const markdownImageId = response.id;
      addUpload(modelName.MARKDOWN_IMAGES, markdownImageId, file);
      return markdownImageId;
    },
    [addUpload],
  );

  return { addImageUpload };
};
