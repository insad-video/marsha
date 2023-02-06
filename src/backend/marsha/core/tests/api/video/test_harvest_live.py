"""Tests for the Video harvest live API of the Marsha project."""
from datetime import datetime, timedelta
import json
import random
from unittest import mock

from django.test import TestCase, override_settings

from marsha.core import api, factories
from marsha.core.api import timezone
from marsha.core.defaults import (
    HARVESTING,
    IDLE,
    JITSI,
    LIVE_CHOICES,
    PENDING,
    RAW,
    RUNNING,
    STOPPED,
    STOPPING,
)
from marsha.core.simple_jwt.factories import (
    InstructorOrAdminLtiTokenFactory,
    StudentLtiTokenFactory,
)
from marsha.core.utils.medialive_utils import ManifestMissingException
from marsha.core.utils.time_utils import to_timestamp


class VideoHarvestLiveAPITest(TestCase):
    """Test the "harvest live" API of the video object."""

    maxDiff = None

    def test_api_video_harvest_live_anonymous_user(self):
        """Anonymous users are not allowed to harvest a live."""
        video = factories.VideoFactory()

        response = self.client.post(f"/api/videos/{video.id}/harvest-live/")

        self.assertEqual(response.status_code, 401)
        content = json.loads(response.content)
        self.assertEqual(
            content, {"detail": "Authentication credentials were not provided."}
        )

    def test_api_video_instructor_harvest_live_in_read_only(self):
        """An instructor with read_only set to true should not be able to harvest a live."""
        video = factories.VideoFactory()
        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=video,
            permissions__can_update=False,
        )

        response = self.client.post(
            f"/api/videos/{video.id}/harvest-live/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)

    def test_api_video_student_harvest_live(self):
        """A student should not be able to harvest a live."""
        video = factories.VideoFactory()
        jwt_token = StudentLtiTokenFactory(resource=video)

        response = self.client.post(
            f"/api/videos/{video.id}/harvest-live/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 403)
        content = json.loads(response.content)
        self.assertEqual(
            content, {"detail": "You do not have permission to perform this action."}
        )

    def test_api_video_harvest_live_staff_or_user(self):
        """Users authenticated via a session should not be able to harvest a live."""
        for user in [factories.UserFactory(), factories.UserFactory(is_staff=True)]:
            self.client.login(username=user.username, password="test")
            video = factories.VideoFactory()

            response = self.client.post(f"/api/videos/{video.id}/harvest-live/")
            self.assertEqual(response.status_code, 401)
            content = json.loads(response.content)
            self.assertEqual(
                content, {"detail": "Authentication credentials were not provided."}
            )

    @override_settings(LIVE_CHAT_ENABLED=True)
    def test_api_video_instructor_harvest_idle_live(self):
        """An instructor can not harvest a live in idle state."""
        video = factories.VideoFactory(
            live_state=IDLE,
            live_type=JITSI,
        )

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)
        response = self.client.post(
            f"/api/videos/{video.id}/harvest-live/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                "error": f"Live video must be stopped before harvesting it. "
                f"Current status is {IDLE}"
            },
        )

    @override_settings(LIVE_CHAT_ENABLED=True)
    @override_settings(XMPP_BOSH_URL="https://xmpp-server.com/http-bind")
    @override_settings(XMPP_CONFERENCE_DOMAIN="conference.xmpp-server.com")
    @override_settings(XMPP_DOMAIN="conference.xmpp-server.com")
    @override_settings(XMPP_JWT_SHARED_SECRET="xmpp_shared_secret")
    def test_api_video_instructor_harvest_paused_live_recording_slice(self):
        """An instructor can harvest a live in stopped state during recording.

        If recording slices exist, the live should be harvested."""
        start = timezone.now()
        stop = start + timedelta(minutes=10)
        video = factories.VideoFactory(
            recording_slices=[{"start": to_timestamp(start)}],
            live_state=STOPPED,
            live_type=JITSI,
            live_info={
                "medialive": {
                    "input": {
                        "id": "medialive_input_1",
                        "endpoints": [
                            "https://live_endpoint1",
                            "https://live_endpoint2",
                        ],
                    },
                    "channel": {"id": "medialive_channel_1"},
                },
                "mediapackage": {
                    "id": "mediapackage_channel_1",
                    "endpoints": {
                        "hls": {
                            "id": "endpoint1",
                            "url": "https://channel_endpoint1/live.m3u8",
                        },
                    },
                },
            },
        )

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)

        with mock.patch.object(timezone, "now", return_value=stop), mock.patch.object(
            api.video, "delete_aws_element_stack"
        ) as mock_delete_aws_element_stack, mock.patch.object(
            api.video, "create_mediapackage_harvest_job"
        ) as mock_create_mediapackage_harvest_job, mock.patch.object(
            api.video, "close_room"
        ) as mock_close_room, mock.patch(
            "marsha.core.serializers.xmpp_utils.generate_jwt"
        ) as mock_jwt_encode, mock.patch(
            "marsha.websocket.utils.channel_layers_utils.dispatch_video_to_groups"
        ) as mock_dispatch_video_to_groups:
            mock_jwt_encode.return_value = "xmpp_jwt"
            response = self.client.post(
                f"/api/videos/{video.id}/harvest-live/",
                HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            )
            mock_delete_aws_element_stack.assert_called_once()
            mock_create_mediapackage_harvest_job.assert_called_once()
            mock_close_room.assert_called_once_with(video.id)
            mock_dispatch_video_to_groups.assert_has_calls(
                [mock.call(video), mock.call(video)]
            )

        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)

        self.assertEqual(
            content,
            {
                "active_shared_live_media": None,
                "active_shared_live_media_page": None,
                "allow_recording": True,
                "description": video.description,
                "estimated_duration": None,
                "has_chat": True,
                "has_live_media": True,
                "id": str(video.id),
                "title": video.title,
                "active_stamp": None,
                "is_public": False,
                "is_ready_to_show": True,
                "is_recording": False,
                "is_scheduled": False,
                "join_mode": "approval",
                "show_download": True,
                "starting_at": None,
                "upload_state": PENDING,
                "thumbnail": None,
                "timed_text_tracks": [],
                "urls": {
                    "manifests": {
                        "hls": "https://channel_endpoint1/live.m3u8",
                    },
                    "mp4": {},
                    "thumbnails": {},
                },
                "should_use_subtitle_as_transcript": False,
                "has_transcript": False,
                "participants_asking_to_join": [],
                "participants_in_discussion": [],
                "playlist": {
                    "id": str(video.playlist.id),
                    "title": video.playlist.title,
                    "lti_id": video.playlist.lti_id,
                },
                "recording_time": 600,
                "shared_live_medias": [],
                "live_state": HARVESTING,
                "live_info": {
                    "medialive": {
                        "input": {
                            "endpoints": [
                                "https://live_endpoint1",
                                "https://live_endpoint2",
                            ],
                        }
                    },
                    "jitsi": {
                        "config_overwrite": {},
                        "domain": "meet.jit.si",
                        "external_api_url": "https://meet.jit.si/external_api.js",
                        "interface_config_overwrite": {},
                        "room_name": str(video.pk),
                    },
                },
                "live_type": JITSI,
                "xmpp": {
                    "bosh_url": "https://xmpp-server.com/http-bind?token=xmpp_jwt",
                    "conference_url": f"{video.id}@conference.xmpp-server.com",
                    "converse_persistent_store": "localStorage",
                    "jid": "conference.xmpp-server.com",
                    "websocket_url": None,
                },
                "tags": [],
                "license": None,
            },
        )
        video.refresh_from_db()
        self.assertEqual(
            video.recording_slices,
            [
                {
                    "start": to_timestamp(start),
                    "stop": to_timestamp(stop),
                    "status": PENDING,
                }
            ],
        )

    @override_settings(LIVE_CHAT_ENABLED=False)
    def test_api_video_instructor_stop_live_recording_slice(self):
        """When a video is stopped during recording, recording should be stopped."""
        start = datetime(2021, 11, 16, tzinfo=timezone.utc)
        stop = start + timedelta(minutes=10)
        video = factories.VideoFactory(
            id="27a23f52-3379-46a2-94fa-697b59cfe3c7",
            playlist__title="foo bar",
            playlist__lti_id="course-v1:ufr+mathematics+00001",
            recording_slices=[{"start": to_timestamp(start)}],
            upload_state=PENDING,
            live_state=RUNNING,
            live_info={
                "medialive": {
                    "input": {
                        "id": "medialive_input_1",
                        "endpoints": [
                            "https://live_endpoint1",
                            "https://live_endpoint2",
                        ],
                    },
                    "channel": {"id": "medialive_channel_1"},
                },
                "mediapackage": {
                    "id": "mediapackage_channel_1",
                    "endpoints": {
                        "hls": {
                            "id": "endpoint1",
                            "url": "https://channel_endpoint1/live.m3u8",
                        },
                    },
                },
            },
            live_type=RAW,
        )
        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)

        # stop a live video,
        with mock.patch.object(timezone, "now", return_value=stop), mock.patch.object(
            api.video, "stop_live_channel"
        ), mock.patch(
            "marsha.websocket.utils.channel_layers_utils.dispatch_video_to_groups"
        ) as mock_dispatch_video_to_groups:
            response = self.client.post(
                f"/api/videos/{video.id}/stop-live/",
                HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            )
            mock_dispatch_video_to_groups.assert_called_once_with(video)
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)

        self.assertEqual(
            content,
            {
                "active_shared_live_media": None,
                "active_shared_live_media_page": None,
                "allow_recording": True,
                "description": video.description,
                "estimated_duration": None,
                "has_chat": True,
                "has_live_media": True,
                "id": str(video.id),
                "title": video.title,
                "active_stamp": None,
                "is_public": False,
                "is_ready_to_show": True,
                "is_recording": False,
                "is_scheduled": False,
                "join_mode": "approval",
                "show_download": True,
                "starting_at": None,
                "upload_state": PENDING,
                "thumbnail": None,
                "timed_text_tracks": [],
                "urls": {
                    "manifests": {
                        "hls": "https://channel_endpoint1/live.m3u8",
                    },
                    "mp4": {},
                    "thumbnails": {},
                },
                "should_use_subtitle_as_transcript": False,
                "has_transcript": False,
                "participants_asking_to_join": [],
                "participants_in_discussion": [],
                "playlist": {
                    "id": str(video.playlist.id),
                    "title": "foo bar",
                    "lti_id": "course-v1:ufr+mathematics+00001",
                },
                "recording_time": 600,
                "shared_live_medias": [],
                "live_state": STOPPING,
                "live_info": {
                    "medialive": {
                        "input": {
                            "endpoints": [
                                "https://live_endpoint1",
                                "https://live_endpoint2",
                            ],
                        }
                    },
                },
                "live_type": RAW,
                "xmpp": None,
                "tags": [],
                "license": None,
            },
        )
        video.refresh_from_db()
        self.assertEqual(
            video.recording_slices,
            [
                {
                    "start": to_timestamp(start),
                    "stop": to_timestamp(stop),
                    "status": PENDING,
                }
            ],
        )

    @override_settings(LIVE_CHAT_ENABLED=True)
    @override_settings(XMPP_BOSH_URL="https://xmpp-server.com/http-bind")
    @override_settings(XMPP_CONFERENCE_DOMAIN="conference.xmpp-server.com")
    @override_settings(XMPP_DOMAIN="conference.xmpp-server.com")
    @override_settings(XMPP_JWT_SHARED_SECRET="xmpp_shared_secret")
    def test_api_video_instructor_harvest_paused_live_no_recording_slice(self):
        """An instructor can harvest a live in stopped state during recording.

        If no recording slices exist, the live should not be harvested."""
        start = timezone.now()
        stop = start + timedelta(minutes=10)
        video = factories.VideoFactory(
            live_state=STOPPED,
            live_type=JITSI,
            live_info={
                "medialive": {
                    "input": {
                        "id": "medialive_input_1",
                        "endpoints": [
                            "https://live_endpoint1",
                            "https://live_endpoint2",
                        ],
                    },
                    "channel": {"id": "medialive_channel_1"},
                },
                "mediapackage": {
                    "id": "mediapackage_channel_1",
                    "endpoints": {
                        "hls": {
                            "id": "endpoint1",
                            "url": "https://channel_endpoint1/live.m3u8",
                        },
                    },
                },
            },
        )

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)

        with mock.patch.object(timezone, "now", return_value=stop), mock.patch.object(
            api.video, "delete_aws_element_stack"
        ) as mock_delete_aws_element_stack, mock.patch.object(
            api.video, "create_mediapackage_harvest_job"
        ) as mock_create_mediapackage_harvest_job, mock.patch.object(
            api.video, "close_room"
        ) as mock_close_room, mock.patch(
            "marsha.core.serializers.xmpp_utils.generate_jwt"
        ) as mock_jwt_encode, mock.patch(
            "marsha.websocket.utils.channel_layers_utils.dispatch_video_to_groups"
        ) as mock_dispatch_video_to_groups:
            mock_jwt_encode.return_value = "xmpp_jwt"
            response = self.client.post(
                f"/api/videos/{video.id}/harvest-live/",
                HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            )
            mock_delete_aws_element_stack.assert_not_called()
            mock_create_mediapackage_harvest_job.assert_not_called()
            mock_close_room.assert_not_called()
            mock_dispatch_video_to_groups.assert_not_called()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"error": "Live video must be recording before harvesting it."},
        )

    def test_api_video_instructor_harvest_paused_live_missing_manifest(self):
        """An instructor harvesting a live with a missing manifest should delete the aws stack."""
        start = timezone.now()
        video = factories.VideoFactory(
            recording_slices=[
                {"start": to_timestamp(start), "stop": to_timestamp(start)}
            ],
            live_state=STOPPED,
            live_type=JITSI,
            live_info={
                "medialive": {
                    "input": {
                        "id": "medialive_input_1",
                        "endpoints": [
                            "https://live_endpoint1",
                            "https://live_endpoint2",
                        ],
                    },
                    "channel": {"id": "medialive_channel_1"},
                },
                "mediapackage": {
                    "id": "mediapackage_channel_1",
                    "channel": {"id": "channel1"},
                    "endpoints": {
                        "hls": {
                            "id": "endpoint1",
                            "url": "https://channel_endpoint1/live.m3u8",
                        },
                    },
                },
                "started_at": "1533686400",
                "stopped_at": "1533686400",
            },
        )

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)

        with mock.patch.object(
            api.video, "delete_aws_element_stack"
        ) as mock_delete_aws_element_stack, mock.patch.object(
            api.video,
            "create_mediapackage_harvest_job",
            side_effect=ManifestMissingException,
        ) as mock_create_mediapackage_harvest_job, mock.patch(
            "marsha.core.api.video.delete_mediapackage_channel"
        ) as mock_delete_mediapackage_channel, mock.patch(
            "marsha.websocket.utils.channel_layers_utils.dispatch_video_to_groups"
        ) as mock_dispatch_video_to_groups:
            response = self.client.post(
                f"/api/videos/{video.id}/harvest-live/",
                HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            )
            mock_delete_aws_element_stack.assert_called_once()
            mock_create_mediapackage_harvest_job.assert_called_once()
            mock_delete_mediapackage_channel.assert_called_once()
            mock_dispatch_video_to_groups.assert_has_calls(
                [mock.call(video), mock.call(video)]
            )

        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)

        self.assertEqual(
            content,
            {
                "active_shared_live_media": None,
                "active_shared_live_media_page": None,
                "allow_recording": True,
                "description": video.description,
                "estimated_duration": None,
                "has_chat": True,
                "has_live_media": True,
                "id": str(video.id),
                "title": video.title,
                "active_stamp": None,
                "is_public": False,
                "is_ready_to_show": True,
                "is_recording": False,
                "is_scheduled": False,
                "join_mode": "approval",
                "show_download": True,
                "starting_at": None,
                "upload_state": PENDING,
                "thumbnail": None,
                "timed_text_tracks": [],
                "urls": None,
                "should_use_subtitle_as_transcript": False,
                "has_transcript": False,
                "participants_asking_to_join": [],
                "participants_in_discussion": [],
                "playlist": {
                    "id": str(video.playlist.id),
                    "title": video.playlist.title,
                    "lti_id": video.playlist.lti_id,
                },
                "recording_time": 0,
                "shared_live_medias": [],
                "live_state": STOPPED,
                "live_info": {
                    "jitsi": {
                        "config_overwrite": {},
                        "domain": "meet.jit.si",
                        "external_api_url": "https://meet.jit.si/external_api.js",
                        "interface_config_overwrite": {},
                        "room_name": str(video.id),
                    },
                    "started_at": "1533686400",
                    "stopped_at": "1533686400",
                },
                "live_type": JITSI,
                "xmpp": None,
                "tags": [],
                "license": None,
            },
        )
        video.refresh_from_db()
        self.assertEqual(
            video.live_info,
            {
                "started_at": "1533686400",
                "stopped_at": "1533686400",
            },
        )

    def test_api_video_instructor_harvest_live_wrong_live_state(self):
        """An instructor can not harvest a live not in STOPPED state."""
        video = factories.VideoFactory(
            live_state=random.choice(
                [s[0] for s in LIVE_CHOICES if s[0] is not STOPPED]
            ),
            live_type=JITSI,
        )
        jwt_token = InstructorOrAdminLtiTokenFactory(resource=video)

        with mock.patch(
            "marsha.websocket.utils.channel_layers_utils.dispatch_video_to_groups"
        ) as mock_dispatch_video_to_groups:
            response = self.client.post(
                f"/api/videos/{video.id}/harvest-live/",
                HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            )
            mock_dispatch_video_to_groups.assert_not_called()

        self.assertEqual(response.status_code, 400)
        content = json.loads(response.content)
        self.assertEqual(
            content,
            {
                "error": (
                    "Live video must be stopped before harvesting it."
                    f" Current status is {video.live_state}"
                )
            },
        )
