import { Nullable } from 'utils/types';

import { Document } from './file';
import { modelName } from './models';
import { Live, Playlist, Video } from './tracks';

export enum appState {
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum flags {
  BBB = 'BBB',
  DEPOSIT = 'deposit',
  MARKDOWN = 'markdown',
  SENTRY = 'sentry',
  LIVE_RAW = 'live_raw',
}

/**
 * Declare your apps here
 * App name needs to match the folder containing the app in `apps/{myAppName}/`
 */
export enum appNames {
  BBB = 'bbb',
  DEPOSIT = 'deposit',
  MARKDOWN = 'markdown',
}

export interface AppConfig {
  attendanceDelay: number;
  state: appState;
  video?: Nullable<Video>;
  videos?: Video[];
  webinars?: Live[];
  document?: Nullable<Document>;
  documents?: Document[];
  resource?: any;
  modelName: modelName.VIDEOS | modelName.DOCUMENTS;
  appName?: appNames;
  new_document_url?: string;
  new_video_url?: string;
  lti_select_form_action_url?: string;
  lti_select_form_data?: {
    [key: string]: string;
  };
  sentry_dsn: Nullable<string>;
  environment: string;
  frontend: string;
  release: string;
  static: {
    svg: {
      icons: string;
    };
    img: {
      bbbBackground?: string;
      bbbLogo?: string;
      liveBackground: string;
      liveErrorBackground: string;
      marshaWhiteLogo: string;
      videoWizardBackground: string;
    };
  };
  player?: string;
  playlist?: Playlist;
  flags?: {
    [key in flags]?: boolean;
  };
  uploadPollInterval: number;
}

export interface AuthenticatedUser {
  jwt?: string;
}

export type AppData = AppConfig & AuthenticatedUser;