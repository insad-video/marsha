import { act, cleanup, render } from '@testing-library/react';
import React from 'react';

import { DashboardObjectProgress } from '.';
import { useObjectProgress } from '../../data/stores/useObjectProgress';

describe('<DashboardVideoPaneProgress />', () => {
  afterEach(cleanup);

  let setObjectProgress: any;
  const ControlComponent = () => {
    setObjectProgress = useObjectProgress(state => state.setObjectProgress);
    return null;
  };

  it('renders and displays the current progress', () => {
    const { getByText } = render(<DashboardObjectProgress objectId={'42'} />);
    getByText('0%');

    render(<ControlComponent />);
    act(() => setObjectProgress('42', 51));
    getByText('51%');
  });
});
