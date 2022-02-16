import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { wrapInIntlProvider } from 'utils/tests/intl';

import { ShowLiveFeedback } from '.';

describe('<ShowLiveFeedback />', () => {
  it('renders the button', () => {
    const onClick = jest.fn();

    render(wrapInIntlProvider(<ShowLiveFeedback showLive={onClick} />));

    expect(onClick).not.toHaveBeenCalled();

    userEvent.click(screen.getByRole('button', { name: 'Show live feedback' }));

    expect(onClick).toHaveBeenCalled();
  });
});
