import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { UploadSubtitles } from '.';
import { useInfoWidgetModal } from 'data/stores/useInfoWidgetModal';
import { useJwt } from 'data/stores/useJwt';
import { useTimedTextTrackLanguageChoices } from 'data/stores/useTimedTextTrackLanguageChoices';
import { videoMockFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';
import { wrapInVideo } from 'utils/tests/wrapInVideo';

jest.mock('data/stores/useInfoWidgetModal', () => ({
  useInfoWidgetModal: jest.fn(),
}));

const mockUseInfoWidgetModal = useInfoWidgetModal as jest.MockedFunction<
  typeof useInfoWidgetModal
>;

const languageChoices = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
];

describe('<UploadSubtitles />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'some token',
      getDecodedJwt: () => ({ locale: 'fr_FR' } as any),
    });
  });

  it('renders the UploadSubtitles', () => {
    const mockSetInfoWidgetModalProvider = jest.fn();
    mockUseInfoWidgetModal.mockReturnValue([
      null,
      mockSetInfoWidgetModalProvider,
    ]);
    const mockedVideo = videoMockFactory();

    useTimedTextTrackLanguageChoices.setState({
      choices: languageChoices,
    });

    render(wrapInVideo(<UploadSubtitles />, mockedVideo));

    screen.getByText('Subtitles');

    const infoButton = screen.getByRole('button', { name: 'help' });
    act(() => userEvent.click(infoButton));

    expect(mockSetInfoWidgetModalProvider).toHaveBeenCalledTimes(1);
    expect(mockSetInfoWidgetModalProvider).toHaveBeenLastCalledWith({
      title: 'Subtitles',
      text: 'This widget allows you upload subtitles for the video.',
    });
  });
});