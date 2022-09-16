import { screen } from '@testing-library/react';
import React from 'react';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';
import { FULL_SCREEN_ERROR_ROUTE } from 'components/ErrorComponents/route';
import { PLAYER_ROUTE } from 'components/routes';
import { useJwt } from 'data/stores/useJwt';
import { modelName } from 'types/models';
import { documentMockFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';

import { RedirectDocument } from './RedirectDocument';

describe('RedirectDocument', () => {
  beforeEach(() => jest.resetAllMocks());

  it('redirects to the player when the document is ready to show', () => {
    const document = documentMockFactory({
      is_ready_to_show: true,
    });

    render(<RedirectDocument document={document} />, {
      routerOptions: {
        routes: [
          {
            path: DASHBOARD_ROUTE(modelName.DOCUMENTS),
            render: () => <span>dashboard</span>,
          },
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
          {
            path: PLAYER_ROUTE(modelName.DOCUMENTS),
            render: () => <span>document player</span>,
          },
        ],
      },
    });

    screen.getByText('document player');
  });

  it('redirects to the dashboard when the user has update permission and the document is not ready to show', () => {
    useJwt.setState({
      getDecodedJwt: () =>
        ({
          permissions: {
            can_update: true,
          },
        } as any),
    });
    const document = documentMockFactory({
      is_ready_to_show: false,
    });

    render(<RedirectDocument document={document} />, {
      routerOptions: {
        routes: [
          {
            path: DASHBOARD_ROUTE(modelName.DOCUMENTS),
            render: () => <span>dashboard</span>,
          },
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
          {
            path: PLAYER_ROUTE(modelName.DOCUMENTS),
            render: () => <span>document player</span>,
          },
        ],
      },
    });

    screen.getByText('dashboard');
  });

  it('redirects to the error view when the user has no update permission and the document is not ready to show', () => {
    useJwt.setState({
      getDecodedJwt: () =>
        ({
          permissions: {
            can_update: false,
          },
        } as any),
    });
    const document = documentMockFactory({
      is_ready_to_show: false,
    });

    render(<RedirectDocument document={document} />, {
      routerOptions: {
        routes: [
          {
            path: DASHBOARD_ROUTE(modelName.DOCUMENTS),
            render: () => <span>dashboard</span>,
          },
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
          {
            path: PLAYER_ROUTE(modelName.DOCUMENTS),
            render: () => <span>document player</span>,
          },
        ],
      },
    });

    screen.getByText('Error Component: notFound');
  });
});