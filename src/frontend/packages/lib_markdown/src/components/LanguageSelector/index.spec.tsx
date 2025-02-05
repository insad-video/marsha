import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib-tests';
import React from 'react';

import { LanguageSelector } from './index';

describe('<LanguageSelector />', () => {
  it('displays languages', async () => {
    const onLanguageChange = jest.fn();

    const { rerender } = render(
      <LanguageSelector
        currentLanguage="en"
        onLanguageChange={onLanguageChange}
        disabled={false}
      />,
    );

    userEvent.click(screen.getByRole('button', { name: /Select language/i }));
    userEvent.click(await screen.findByRole('option', { name: /French/i }));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('fr');

    rerender(
      <LanguageSelector
        currentLanguage="fr"
        onLanguageChange={onLanguageChange}
        disabled={false}
      />,
    );

    userEvent.click(screen.getByRole('button', { name: /Select language/i }));
    userEvent.click(await screen.findByRole('option', { name: /English/i }));

    expect(onLanguageChange).toHaveBeenCalledTimes(2);
    expect(onLanguageChange).toHaveBeenLastCalledWith('en');
  });

  it('displays available languages', () => {
    const onLanguageChange = jest.fn();

    render(
      <LanguageSelector
        currentLanguage="en"
        onLanguageChange={onLanguageChange}
        disabled={false}
        availableLanguages={['en']}
      />,
    );

    userEvent.click(screen.getByRole('button', { name: /Select language/i }));

    expect(screen.queryByText('French')).not.toBeInTheDocument();
  });

  it('displays available languages if current language is not', async () => {
    const onLanguageChange = jest.fn();

    render(
      <LanguageSelector
        currentLanguage="en"
        onLanguageChange={onLanguageChange}
        disabled={false}
        availableLanguages={['fr']}
      />,
    );

    userEvent.click(screen.getByRole('button', { name: /Select language/i }));
    userEvent.click(await screen.findByRole('option', { name: /French/i }));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });
});
