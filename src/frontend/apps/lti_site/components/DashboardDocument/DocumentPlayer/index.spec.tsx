import { fireEvent, screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import React from 'react';

import { useJwt } from 'data/stores/useJwt';
import { XAPI_ENDPOINT } from 'settings';
import { uploadState } from 'types/tracks';
import { documentMockFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';

import DocumentPlayer from '.';

const mockDocument = documentMockFactory({
  id: '42',
  title: 'foo.pdf',
  upload_state: uploadState.READY,
});
jest.mock('data/stores/useAppConfig', () => ({
  useAppConfig: () => ({
    document: mockDocument,
  }),
}));

describe('<DocumentPlayer />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'foo',
      getDecodedJwt: () =>
        ({
          session_id: 'abcd',
        } as any),
    });
  });

  it('renders', () => {
    const document = documentMockFactory({
      id: '42',
      title: 'foo.pdf',
    });
    const { elementContainer: container } = render(
      <DocumentPlayer document={document} />,
    );

    screen.getByRole('link', { name: 'foo.pdf' });
    expect(container!.getElementsByClassName('icon-file-text2')).toHaveLength(
      1,
    );
  });

  it('defaults to the document from props', () => {
    const document = documentMockFactory({
      id: '43',
      title: 'bar.pdf',
    });
    const { elementContainer: container } = render(
      <DocumentPlayer document={document} />,
    );

    screen.getByRole('link', { name: 'bar.pdf' });
    expect(container!.getElementsByClassName('icon-file-text2')).toHaveLength(
      1,
    );
  });

  it('sends the xapi downloaded statement when clicking on the link', async () => {
    fetchMock.mock(`${XAPI_ENDPOINT}/document/`, 204);
    const document = documentMockFactory({
      id: '42',
      title: 'foo.pdf',
    });
    render(<DocumentPlayer document={document} />);

    const toDownload = screen.getByRole('link', { name: 'foo.pdf' });

    fireEvent.click(toDownload);
    fireEvent.blur(window);

    await waitFor(() =>
      expect(fetchMock.called(`${XAPI_ENDPOINT}/document/`)).toBe(true),
    );
  });
});