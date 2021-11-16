import { Playlist, Resource } from 'types/tracks';

export interface Meeting extends Resource {
  playlist: Playlist;
  title: string;
  lti_url: string;
  started: boolean;
  url: string;
  welcome_text: string;
  infos?: MeetingInfos;
}

export interface MeetingInfos {
  returncode: string;
  meetingName: string;
  meetingID: string;
  internalMeetingID: string;
  createTime: string;
  createDate: string;
  voiceBridge: string;
  dialNumber: string;
  attendeePW: string;
  moderatorPW: string;
  running: string;
  duration: string;
  hasUserJoined: string;
  recording: string;
  hasBeenForciblyEnded: string;
  startTime: string;
  endTime: string;
  participantCount: string;
  listenerCount: string;
  voiceParticipantCount: string;
  videoCount: string;
  maxUsers: string;
  moderatorCount: string;
  attendees: string;
  metadata: string;
  isBreakout: string;
}

export enum modelName {
  MEETINGS = 'meetings',
}

export interface CreateMeetingRequest {
  welcome_text: string;
}

export interface CreateMeetingResponse {
  createDate: string;
  createTime: string;
  dialNumber: string;
  duration: string;
  hasBeenForciblyEnded: string;
  hasUserJoined: string;
  internalMeetingID: string;
  meetingID: string;
  message: string;
  messageKey: string;
  moderatorPW: string;
  parentMeetingID: string;
  returncode: string;
  voiceBridge: string;
}

export interface JoinMeetingRequest {
  fullname: string;
}

export interface JoinMeetingResponse {
  auth_token: string;
  guestStatus: string;
  meeting_id: string;
  message: string;
  messageKey: string;
  returncode: string;
  session_token: string;
  url: string;
  user_id: string;
}

export interface EndMeetingRequest {
  welcome_text: string;
}

export interface EndMeetingResponse {
  message: string;
  messageKey: string;
  returncode: string;
}