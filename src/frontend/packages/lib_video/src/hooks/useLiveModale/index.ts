import { Nullable } from 'lib-common';
import { createStore } from 'lib-components';

import { LiveModaleProps } from 'components/live/common/LiveModale';

const store = createStore<Nullable<LiveModaleProps>>('useLiveModale');

export const LiveModaleConfigurationProvider = store.Provider;
export const useLiveModaleConfiguration = store.useStore;
