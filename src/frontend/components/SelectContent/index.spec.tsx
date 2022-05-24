import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { Grommet, Tab } from 'grommet';
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appData } from 'data/appData';
import {
  documentMockFactory,
  playlistMockFactory,
  videoMockFactory,
} from 'utils/tests/factories';
import { wrapInIntlProvider } from 'utils/tests/intl';
import { uploadState } from 'types/tracks';

import { SelectContent, SelectContentTabProps } from './index';

jest.mock('data/appData', () => ({
  appData: {
    new_document_url: 'https://example.com/lti/documents/',
    new_video_url: 'https://example.com/lti/videos/',
    lti_select_form_action_url: '/lti/select/',
    lti_select_form_data: {},
  },
}));

jest.mock('components/Loader', () => ({
  Loader: () => <span>Loader</span>,
}));

const mockCustomSelectContentTab = ({
  selectContent,
}: SelectContentTabProps) => (
  <Tab title="Custom app tab">
    <p
      onClick={() =>
        selectContent(
          'custom-select-content-url',
          'Custom select content title',
          'Custom select content description',
        )
      }
    >
      Select app content
    </p>
  </Tab>
);

jest.mock(
  '../../apps/custom_app/SelectContentTab',
  () => mockCustomSelectContentTab,
  {
    virtual: true,
  },
);

const mockOtherCustomSelectContentTab = ({
  selectContent,
}: SelectContentTabProps) => (
  <Tab title="Other custom app tab">
    <p
      onClick={() =>
        selectContent(
          'other-custom-select-content-url',
          'Other custom select content title',
          'Other custom select content description',
        )
      }
    >
      Other select app content
    </p>
  </Tab>
);

jest.mock(
  '../../apps/other_custom_app/SelectContentTab',
  () => mockOtherCustomSelectContentTab,
  {
    virtual: true,
  },
);

/**
 * Mock available app type in the front to provide the app used in the test
 */
jest.mock('types/AppData.ts', () => ({
  appNames: {
    custom_app: 'custom_app',
    other_custom_app: 'other_custom_app',
  },
}));

/**
 * Mock appConfig to override real config because enums are mock
 * and real values don't exist anymore
 */
jest.mock('data/appConfigs.ts', () => ({
  appConfigs: {},
}));

window.HTMLFormElement.prototype.submit = jest.fn();

const queryClient = new QueryClient();

describe('<SelectContent />', () => {
  afterEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
  });

  it('displays content infos', async () => {
    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Grommet>
            <Toaster />
            <SelectContent
              playlist={playlistMockFactory({
                id: '1',
                title: 'Playlist 1',
              })}
              documents={[
                documentMockFactory({
                  id: '1',
                  title: 'Document 1',
                  upload_state: uploadState.PROCESSING,
                  is_ready_to_show: false,
                }),
              ]}
              videos={[
                videoMockFactory({
                  id: '1',
                  title: 'Video 1',
                  upload_state: uploadState.PROCESSING,
                  is_ready_to_show: false,
                }),
                videoMockFactory({
                  id: '2',
                  title: 'Video 2',
                  upload_state: uploadState.READY,
                  is_ready_to_show: true,
                }),
              ]}
              new_document_url={appData.new_document_url}
              new_video_url={appData.new_video_url}
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={appData.lti_select_form_data!}
            />
          </Grommet>
        </QueryClientProvider>,
      ),
    );

    screen.getByText('Playlist Playlist 1 (1)');

    const video1 = screen.getByTitle('Select Video 1');
    expect(video1.getElementsByTagName('img')[0]).toHaveAttribute(
      'src',
      'https://example.com/default_thumbnail/144',
    );

    expect(screen.queryByText('Video 1')).toBeNull();
    expect(screen.queryByText('Not uploaded')).toBeNull();
    expect(screen.queryByText('Not ready to show')).toBeNull();
    userEvent.hover(video1);
    screen.getByText('Video 1');
    screen.getByLabelText('Not uploaded');
    screen.getByLabelText('Not ready to show');
    userEvent.unhover(video1);

    expect(screen.queryByText('Video 2')).toBeNull();
    expect(screen.queryByText('Uploaded')).toBeNull();
    expect(screen.queryByText('Ready to show')).toBeNull();
    userEvent.hover(screen.getByTitle('Select Video 2'));
    screen.getByText('Video 2');
    screen.getByLabelText('Uploaded');
    screen.getByLabelText('Ready to show');

    screen.getByRole('tab', {
      name: /videos/i,
    });

    expect(screen.queryByText('Document 1')).toBeNull();
    expect(screen.queryByText('Not uploaded')).toBeNull();
    expect(screen.queryByText('Not ready to show')).toBeNull();
    const documentTab = screen.getByRole('tab', {
      name: 'Documents',
    });
    userEvent.click(documentTab);
    userEvent.hover(screen.getByTitle('Select Document 1'));
    screen.getByText('Document 1');
    screen.getByLabelText('Not uploaded');
    screen.getByLabelText('Not ready to show');
  });

  it('displays first available generated video thumbnail', async () => {
    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Grommet>
            <SelectContent
              videos={[
                videoMockFactory({
                  id: '1',
                  title: 'Video 1',
                  upload_state: uploadState.PROCESSING,
                  is_ready_to_show: false,
                  urls: {
                    manifests: {
                      hls: '',
                    },
                    mp4: {},
                    thumbnails: {
                      480: 'https://example.com/default_thumbnail/480',
                      720: 'https://example.com/default_thumbnail/720',
                      1080: 'https://example.com/default_thumbnail/1080',
                    },
                  },
                }),
              ]}
              new_document_url={appData.new_document_url}
              new_video_url={appData.new_video_url}
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={appData.lti_select_form_data!}
            />
          </Grommet>
        </QueryClientProvider>,
      ),
    );

    screen.getByTitle('Select Video 1');
    expect(
      screen.getByTitle('Select Video 1').getElementsByTagName('img')[0],
    ).toHaveAttribute('src', 'https://example.com/default_thumbnail/480');
  });

  it('displays first available uploaded video thumbnail', async () => {
    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Grommet>
            <SelectContent
              videos={[
                videoMockFactory({
                  id: '1',
                  title: 'Video 1',
                  upload_state: uploadState.PROCESSING,
                  is_ready_to_show: false,
                  thumbnail: {
                    active_stamp: null,
                    is_ready_to_show: true,
                    upload_state: uploadState.READY,
                    id: '1',
                    video: '1',
                    urls: {
                      480: 'https://example.com/uploaded_thumbnail/480',
                      720: 'https://example.com/uploaded_thumbnail/720',
                      1080: 'https://example.com/uploaded_thumbnail/1080',
                    },
                  },
                }),
              ]}
              new_document_url={appData.new_document_url}
              new_video_url={appData.new_video_url}
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={appData.lti_select_form_data!}
            />
          </Grommet>
        </QueryClientProvider>,
      ),
    );

    screen.getByTitle('Select Video 1');
    expect(
      screen.getByTitle('Select Video 1').getElementsByTagName('img')[0],
    ).toHaveAttribute('src', 'https://example.com/uploaded_thumbnail/480');
  });

  it('fallback to generated video thumbnail if uploaded thumbnail not ready', async () => {
    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Grommet>
            <SelectContent
              videos={[
                videoMockFactory({
                  id: '1',
                  title: 'Video 1',
                  upload_state: uploadState.PROCESSING,
                  is_ready_to_show: false,
                  thumbnail: {
                    active_stamp: null,
                    is_ready_to_show: false,
                    upload_state: uploadState.PROCESSING,
                    id: '1',
                    video: '1',
                    urls: {
                      480: 'https://example.com/uploaded_thumbnail/480',
                      720: 'https://example.com/uploaded_thumbnail/720',
                      1080: 'https://example.com/uploaded_thumbnail/1080',
                    },
                  },
                }),
              ]}
              new_document_url={appData.new_document_url}
              new_video_url={appData.new_video_url}
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={appData.lti_select_form_data!}
            />
          </Grommet>
        </QueryClientProvider>,
      ),
    );

    screen.getByTitle('Select Video 1');
    expect(
      screen.getByTitle('Select Video 1').getElementsByTagName('img')[0],
    ).toHaveAttribute('src', 'https://example.com/default_thumbnail/144');
  });

  it('video not uploaded', async () => {
    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Grommet>
            <SelectContent
              videos={[
                videoMockFactory({
                  id: '1',
                  title: 'Video 1',
                  upload_state: uploadState.PENDING,
                  is_ready_to_show: false,
                  urls: null,
                }),
              ]}
              new_document_url={appData.new_document_url}
              new_video_url={appData.new_video_url}
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={appData.lti_select_form_data!}
            />
          </Grommet>
        </QueryClientProvider>,
      ),
    );

    userEvent.hover(screen.getByTitle('Select Video 1'));
    screen.getByText('Video 1');
    screen.getByLabelText('Not uploaded');
    screen.getByLabelText('Not ready to show');
  });

  it('selects content', async () => {
    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            documents={[
              documentMockFactory({
                id: '1',
                title: 'Document 1',
                description: 'Document 1 description',
                upload_state: uploadState.PROCESSING,
                is_ready_to_show: false,
              }),
            ]}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              lti_response_url: 'https://example.com/lti',
              lti_message_type: 'ContentItemSelection',
            }}
          />
        </QueryClientProvider>,
      ),
    );

    const documentTab = screen.getByRole('tab', {
      name: 'Documents',
    });
    userEvent.click(documentTab);
    userEvent.click(screen.getByTitle('Select Document 1'));

    expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);

    expect(container.querySelector('form')).toHaveFormValues({
      lti_response_url: 'https://example.com/lti',
      lti_message_type: 'ContentItemSelection',
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: 'https://example.com/lti/documents/1',
            frame: [],
            title: 'Document 1',
            text: 'Document 1 description',
          },
        ],
      }),
    });
  });

  it('selects content with activity title and description', async () => {
    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            documents={[
              documentMockFactory({
                id: '1',
                title: 'Document 1',
                description: 'Document 1 description',
                upload_state: uploadState.PROCESSING,
                is_ready_to_show: false,
              }),
            ]}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              lti_response_url: 'https://example.com/lti',
              lti_message_type: 'ContentItemSelection',
              activity_title: 'Activity title',
              activity_description: 'Activity description',
            }}
          />
        </QueryClientProvider>,
      ),
    );

    const documentTab = screen.getByRole('tab', {
      name: 'Documents',
    });
    userEvent.click(documentTab);
    userEvent.click(screen.getByTitle('Select Document 1'));

    expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);

    expect(container.querySelector('form')).toHaveFormValues({
      lti_response_url: 'https://example.com/lti',
      lti_message_type: 'ContentItemSelection',
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: 'https://example.com/lti/documents/1',
            frame: [],
            title: 'Activity title',
            text: 'Activity description',
          },
        ],
      }),
    });
  });

  it('selects content with empty activity title and description', async () => {
    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            documents={[
              documentMockFactory({
                id: '1',
                title: 'Document 1',
                description: 'Document 1 description',
                upload_state: uploadState.PROCESSING,
                is_ready_to_show: false,
              }),
            ]}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              lti_response_url: 'https://example.com/lti',
              lti_message_type: 'ContentItemSelection',
              activity_title: '',
              activity_description: '',
            }}
          />
        </QueryClientProvider>,
      ),
    );

    const documentTab = screen.getByRole('tab', {
      name: 'Documents',
    });
    userEvent.click(documentTab);
    userEvent.click(screen.getByTitle('Select Document 1'));

    expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);

    expect(container.querySelector('form')).toHaveFormValues({
      lti_response_url: 'https://example.com/lti',
      lti_message_type: 'ContentItemSelection',
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: 'https://example.com/lti/documents/1',
            frame: [],
            title: 'Document 1',
            text: 'Document 1 description',
          },
        ],
      }),
    });
  });

  it('selects content without document title', async () => {
    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            documents={[
              documentMockFactory({
                id: '1',
                title: null,
                description: 'Document 1 description',
                upload_state: uploadState.PROCESSING,
                is_ready_to_show: false,
              }),
            ]}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              lti_response_url: 'https://example.com/lti',
              lti_message_type: 'ContentItemSelection',
            }}
          />
        </QueryClientProvider>,
      ),
    );

    const documentTab = screen.getByRole('tab', {
      name: 'Documents',
    });
    userEvent.click(documentTab);
    userEvent.click(screen.getByTitle('Select'));

    expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);

    expect(container.querySelector('form')).toHaveFormValues({
      lti_response_url: 'https://example.com/lti',
      lti_message_type: 'ContentItemSelection',
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: 'https://example.com/lti/documents/1',
            frame: [],
            text: 'Document 1 description',
          },
        ],
      }),
    });
  });

  it('adds new content', async () => {
    const playlist = playlistMockFactory();
    const video = videoMockFactory({
      title: null,
      description: null,
    });
    fetchMock.post('/api/videos/', video);

    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            playlist={playlist}
            documents={appData.documents}
            videos={appData.videos}
            new_document_url={appData.new_document_url}
            new_video_url={appData.new_video_url}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={appData.lti_select_form_data!}
          />
        </QueryClientProvider>,
      ),
    );
    act(() => {
      userEvent.click(screen.getByText('Add a video'));
    });

    await waitFor(() => {
      expect(
        fetchMock.called('/api/videos/', {
          body: {
            playlist: playlist.id,
          },
          method: 'POST',
        }),
      ).toBe(true);

      expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
    });

    const form = container.querySelector('form');
    expect(form).toHaveFormValues({
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: `https://example.com/lti/videos/${video.id}`,
            frame: [],
          },
        ],
      }),
    });
    expect(form).toHaveAttribute('action', '/lti/select/');
  });

  it('adds new content with activity title and description', async () => {
    const playlist = playlistMockFactory();
    const video = videoMockFactory({
      title: 'Activity title',
      description: 'Activity description',
    });

    fetchMock.post('/api/videos/', video);

    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            playlist={playlist}
            documents={appData.documents}
            videos={appData.videos}
            new_document_url={appData.new_document_url}
            new_video_url={appData.new_video_url}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              ...appData.lti_select_form_data!,
              activity_title: 'Activity title',
              activity_description: 'Activity description',
            }}
          />
        </QueryClientProvider>,
      ),
    );
    act(() => {
      userEvent.click(screen.getByText('Add a video'));
    });

    await waitFor(() => {
      expect(
        fetchMock.called('/api/videos/', {
          body: {
            playlist: playlist.id,
            title: 'Activity title',
            description: 'Activity description',
          },
          method: 'POST',
        }),
      ).toBe(true);

      expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
    });

    const form = container.querySelector('form');
    expect(form).toHaveFormValues({
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: `https://example.com/lti/videos/${video.id}`,
            frame: [],
            title: 'Activity title',
            text: 'Activity description',
          },
        ],
      }),
    });
    expect(form).toHaveAttribute('action', '/lti/select/');
  });

  it('adds new content with empty activity title and description', async () => {
    const playlist = playlistMockFactory();
    const video = videoMockFactory({
      title: '',
      description: '',
    });

    fetchMock.post('/api/videos/', video);

    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <SelectContent
            playlist={playlist}
            documents={appData.documents}
            videos={appData.videos}
            new_document_url={appData.new_document_url}
            new_video_url={appData.new_video_url}
            lti_select_form_action_url={appData.lti_select_form_action_url!}
            lti_select_form_data={{
              ...appData.lti_select_form_data!,
              activity_title: '',
              activity_description: '',
            }}
          />
        </QueryClientProvider>,
      ),
    );
    act(() => {
      userEvent.click(screen.getByText('Add a video'));
    });

    await waitFor(() => {
      expect(
        fetchMock.called('/api/videos/', {
          body: {
            playlist: playlist.id,
            title: '',
            description: '',
          },
          method: 'POST',
        }),
      ).toBe(true);

      expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
    });

    const form = container.querySelector('form');
    expect(form).toHaveFormValues({
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: `https://example.com/lti/videos/${video.id}`,
            frame: [],
          },
        ],
      }),
    });
    expect(form).toHaveAttribute('action', '/lti/select/');
  });

  it('loads app tab', async () => {
    const { container } = render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Suspense fallback="Loading...">
            <SelectContent
              lti_select_form_action_url={appData.lti_select_form_action_url!}
              lti_select_form_data={{
                lti_response_url: 'https://example.com/lti',
                lti_message_type: 'ContentItemSelection',
              }}
            />
          </Suspense>
        </QueryClientProvider>,
      ),
    );

    const otherCustomAppTab = await screen.findByRole('tab', {
      name: 'Other custom app tab',
    });
    userEvent.click(otherCustomAppTab);
    screen.getByText('Other select app content');
    expect(screen.queryByText('Select app content')).not.toBeInTheDocument();

    const customAppTab = await screen.findByRole('tab', {
      name: 'Custom app tab',
    });
    userEvent.click(customAppTab);
    expect(
      screen.queryByText('Other select app content'),
    ).not.toBeInTheDocument();
    userEvent.click(screen.getByText('Select app content'));

    expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);

    expect(container.querySelector('form')).toHaveFormValues({
      lti_response_url: 'https://example.com/lti',
      lti_message_type: 'ContentItemSelection',
      content_items: JSON.stringify({
        '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
        '@graph': [
          {
            '@type': 'ContentItem',
            url: 'custom-select-content-url',
            frame: [],
            title: 'Custom select content title',
            text: 'Custom select content description',
          },
        ],
      }),
    });
  });
});
