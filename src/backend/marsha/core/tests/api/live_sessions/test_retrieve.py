"""Tests for the livesession retrieve API."""
from datetime import timedelta
import random

from django.utils import timezone

from marsha.core.defaults import IDLE, RAW
from marsha.core.factories import (
    AnonymousLiveSessionFactory,
    ConsumerSiteFactory,
    LiveSessionFactory,
    VideoFactory,
)
from marsha.core.models import NONE, STUDENT
from marsha.core.simple_jwt.factories import (
    InstructorOrAdminLtiTokenFactory,
    LiveSessionLtiTokenFactory,
    LiveSessionResourceAccessTokenFactory,
    LTIResourceAccessTokenFactory,
    ResourceAccessTokenFactory,
)

from .base import LiveSessionApiTestCase


class LiveSessionRetrieveApiTest(LiveSessionApiTestCase):
    """Test the retrieve API of the liveSession object."""

    def _get_url(self, video, live_session):
        """Return the url to use in tests."""
        return f"/api/videos/{video.pk}/livesessions/{live_session.pk}/"

    def test_api_livesession_read_anonymous(self):
        """Anonymous users should not be allowed to fetch a livesession."""
        livesession = AnonymousLiveSessionFactory()
        response = self.client.get(self._get_url(livesession.video, livesession))
        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.json(), {"detail": "Authentication credentials were not provided."}
        )

    def test_api_livesession_read_token_public(self):
        """Token from public context can't read livesession detail."""
        video = VideoFactory()
        livesession = AnonymousLiveSessionFactory(video=video)
        # token has no consumer_site, no context_id and no user's info
        jwt_token = ResourceAccessTokenFactory(resource=video)

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Not found."})

    def test_api_livesession_read_token_public_with_anonymous(self):
        """Token from public context can read livesession detail with
        anonymous_id parameter.
        """
        livesession = AnonymousLiveSessionFactory()
        # token has no consumer_site, no context_id and no user's info
        jwt_token = ResourceAccessTokenFactory(resource=livesession.video)

        response = self.client.get(
            f"{self._get_url(livesession.video, livesession)}"
            f"?anonymous_id={livesession.anonymous_id}",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": str(livesession.anonymous_id),
                "consumer_site": None,
                "display_name": None,
                "email": livesession.email,
                "id": str(livesession.id),
                "is_registered": False,
                "language": "en",
                "live_attendance": None,
                "lti_id": None,
                "lti_user_id": None,
                "should_send_reminders": True,
                "username": None,
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_lti_email_set(self):
        """Token from lti with email can read its livesession."""
        video = VideoFactory()
        # livesession has consumer_site
        livesession = LiveSessionFactory(
            email="sarah@openfun.fr",
            is_registered=False,
            username="John",
            video=video,
            is_from_lti_connection=True,
            lti_user_id="56255f3807599c377bf0e5bf072359fd",
        )
        # token from LTI has context_id, consumer_site and user.id
        jwt_token = LiveSessionResourceAccessTokenFactory(live_session=livesession)
        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(video.playlist.consumer_site_id),
                "display_name": None,
                "email": livesession.email,
                "id": str(livesession.id),
                "is_registered": False,
                "language": "en",
                "live_attendance": None,
                "lti_id": str(video.playlist.lti_id),
                "lti_user_id": "56255f3807599c377bf0e5bf072359fd",
                "should_send_reminders": True,
                "username": "John",
                "video": str(video.id),
            },
        )

    def test_api_livesession_read_token_lti_email_none(
        self,
    ):
        """LTI Token with no email can read its livesession."""
        video = VideoFactory()
        # livesession with consumer_site
        livesession = LiveSessionFactory(
            is_registered=True,
            video=video,
            is_from_lti_connection=True,
            lti_user_id="56255f3807599c377bf0e5bf072359fd",
        )

        # token with right context_id and lti_user_id
        jwt_token = LiveSessionResourceAccessTokenFactory(live_session=livesession)

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(video.playlist.consumer_site.id),
                "display_name": None,
                "email": livesession.email,
                "id": str(livesession.id),
                "is_registered": True,
                "language": "en",
                "live_attendance": None,
                "lti_id": str(video.playlist.lti_id),
                "lti_user_id": "56255f3807599c377bf0e5bf072359fd",
                "should_send_reminders": True,
                "username": None,
                "video": str(video.id),
            },
        )

    def test_api_livesession_read_token_lti_record_email_diff(self):
        """LTI's Token can read the livesession even if they don't have the right email.
        A LTI user is identified by the combinaison of consumer_site/lti_user_id/lti_id
        """
        video = VideoFactory()
        # livesession has consumer_site
        livesession = LiveSessionFactory(
            consumer_site=video.playlist.consumer_site,
            email="sarah@openfun.fr",
            is_registered=True,
            lti_id=str(video.playlist.lti_id),
            lti_user_id="5555",
            video=video,
        )
        # token has right context_id but different email
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            user__email="salmon@openfun.fr",
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 200)
        # email is the one used during livesession
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(video.playlist.consumer_site_id),
                "display_name": None,
                "email": "sarah@openfun.fr",
                "id": str(livesession.id),
                "is_registered": True,
                "language": "en",
                "live_attendance": None,
                "lti_id": str(video.playlist.lti_id),
                "lti_user_id": "5555",
                "should_send_reminders": True,
                "username": None,
                "video": str(video.id),
            },
        )

    def test_api_livesession_read_token_lti_record_consumer_none(self):
        """Control we can only read livesession from the same consumer site.

        The video is portable in an other playlist portable from an other consumer site,
        the livesession should not be return, if this one has been added with
        a token with no consumer_site.
        """
        # livesession has no consumer_site
        livesession = AnonymousLiveSessionFactory()

        # token has context_id so different consumer_site
        jwt_token = LTIResourceAccessTokenFactory(
            resource=livesession.video,  # as usual
            roles=[random.choice([STUDENT, NONE])],
            user__email=livesession.email,  # as usual
            # below arguments are not usual for anonymous live session
            context_id=str(livesession.video.playlist.lti_id),
            consumer_site=str(livesession.video.playlist.consumer_site.id),
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_record_consumer_diff(self):
        """Control we can only read livesession from the same consumer site.

        The video is portable in an other playlist portable from an other consumer site,
        the livesession should not be return, if this one has been added with
        a token with a different consumer_site.
        """
        other_consumer = ConsumerSiteFactory()
        # livesession has consumer_site
        livesession = LiveSessionFactory(
            is_from_lti_connection=True,
            consumer_site=other_consumer,  # enforce other consumer site than video's
        )
        # token has context_id but different one
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            consumer_site=str(
                livesession.video.playlist.consumer_site.id
            ),  # the **video** one
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_record_course_diff(self):
        """Control we can only read livesession from the same course.

        The video is portable in an other playlist portable from an other course,
        the livesession should not be return, if this one has been added with
        a token from a different course.
        """
        other_consumer = ConsumerSiteFactory()
        # livesession has consumer_site
        livesession = LiveSessionFactory(
            is_from_lti_connection=True,
            consumer_site=other_consumer,  # enforce other consumer site than video's
        )

        # token has context_id but different one
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            context_id=f"{livesession.video.playlist.lti_id}_diff",  # different context
            consumer_site=str(
                livesession.video.playlist.consumer_site.id
            ),  # the **video** one
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_record_lti_user_id_diff(self):
        """Control we can only read livesession from the same user."""
        video = VideoFactory()
        # livesession has consumer_site
        livesession = LiveSessionFactory(
            video=video,
            is_from_lti_connection=True,
        )
        # token has context_id but different one
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            context_id=f"{livesession.video.playlist.lti_id}_diff",  # different context
            user__id=f"{livesession.lti_user_id}_diff",  # different user ID
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_public_partially_lti(self):
        """Token with no email and no consumer_site can't read the livesession.

        This case is not supposed to happen. A LTI connection has necessary a
        consumer_site, context_id and a lti_user_id defined in the token.
        """
        # livesession with a consumer_site
        livesession = LiveSessionFactory(is_from_lti_connection=True)

        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            user__email=None,
            consumer_site=None,
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        # combo lti_user_id / consumer_site is needed if token has no email
        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_public_partially_lti_2(self):
        """Token with consumer_site and no user's info can't read livesession detail.

        This case is not supposed to happen. A JWT token from a LTI connection contains
        context_id, consumer_site and user's keys.
        """
        livesession = LiveSessionFactory(is_from_lti_connection=True)

        # token with right context_id but no email or user id
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            user=None,
        )
        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_public_partially_lti_3(self):
        """Token with email can't read the livesession.

        This case is not supposed to happen. Public token has no user's information, only
        lti's connections has the key `user` in the JWT token. A JWT token from a LTI
        connection contains context_id and consumer_site keys.
        """
        video = VideoFactory()
        # livesession has no consumer_site
        livesession = AnonymousLiveSessionFactory(
            email="sarah@openfun.fr",
            video=video,
        )
        # token has no context_id and different email
        jwt_token = LiveSessionLtiTokenFactory(
            live_session=livesession,
            consumer_site=None,
            context_id=None,
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_admin_instruct_token_email_ok(self):
        """Admin/instructor can read any livesession part of the course."""
        # livesession with another email and lti_user_id
        livesession = LiveSessionFactory(
            is_registered=True,
            is_from_lti_connection=True,
            email="different@aol.com",  # explicit to be found in response
            video__playlist__lti_id="Maths",  # explicit to be found in response
            username="Sam",  # explicit to be found in response
        )
        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=livesession.video,
            context_id=str(livesession.video.playlist.lti_id),
            consumer_site=str(livesession.consumer_site.id),
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(livesession.video.playlist.consumer_site_id),
                "display_name": None,
                "email": "different@aol.com",
                "id": str(livesession.id),
                "is_registered": True,
                "language": "en",
                "live_attendance": None,
                "lti_user_id": livesession.lti_user_id,
                "lti_id": "Maths",
                "should_send_reminders": True,
                "username": "Sam",
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_lti_admin_instruct_token_email_none(self):
        """Admin/instructor users don't necessary have an email in token.

        They should be allowed to read a livesession detail if they are in
        the right context_id and consumer_site.
        """
        # livesession with consumer_site
        livesession = LiveSessionFactory(
            is_registered=True,
            is_from_lti_connection=True,
            email="somemail@aol.com",  # explicit to be found in response
            video__playlist__lti_id="Maths",  # explicit to be found in response
            lti_user_id="56255f3807599c377bf0e5bf072359fd",  # explicit to be found in response
        )
        # token with right context_id
        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=livesession.video,
            context_id=str(livesession.video.playlist.lti_id),
            consumer_site=str(livesession.consumer_site.id),
            user__email=None,
            user__id=f"{livesession.lti_user_id}_diff",
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(livesession.video.playlist.consumer_site.id),
                "display_name": None,
                "email": "somemail@aol.com",
                "id": str(livesession.id),
                "is_registered": True,
                "language": "en",
                "live_attendance": None,
                "lti_user_id": "56255f3807599c377bf0e5bf072359fd",
                "lti_id": "Maths",
                "should_send_reminders": True,
                "username": None,
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_lti_admin_instruct_email_diff(self):
        """Admin/instructor can read all livesession belonging to a video."""
        # livesession with no consumer site
        livesession = AnonymousLiveSessionFactory(
            email="different@aol.com",
        )

        jwt_token = InstructorOrAdminLtiTokenFactory(
            # context_id and consumer_site are not determinant (random uuid here)
            resource=livesession.video,
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": str(livesession.anonymous_id),
                "consumer_site": None,
                "display_name": None,
                "email": "different@aol.com",
                "id": str(livesession.id),
                "is_registered": False,
                "language": "en",
                "live_attendance": None,
                "lti_user_id": None,
                "lti_id": None,
                "should_send_reminders": True,
                "username": None,
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_lti_admin_instruct_record_consumer_diff(self):
        """Admin/instructor can read all livesession belonging to a video."""
        other_consumer_site = ConsumerSiteFactory()
        # livesession with consumer_site
        livesession = LiveSessionFactory(
            consumer_site=other_consumer_site,
            is_from_lti_connection=True,
            email="admin@openfun.fr",  # explicit to be found in response
            lti_user_id="56255f3807599c377bf0e5bf072359fd",  # explicit to be found in response
        )

        # token with context_id leading to another consumer site
        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=livesession.video,
            context_id=str(livesession.video.playlist.lti_id),
            # consumer_site is not other_consumer_site
            consumer_site=str(livesession.video.playlist.consumer_site.id),
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(other_consumer_site.id),
                "display_name": None,
                "email": "admin@openfun.fr",
                "id": str(livesession.id),
                "is_registered": False,
                "language": "en",
                "live_attendance": None,
                "lti_user_id": "56255f3807599c377bf0e5bf072359fd",
                "lti_id": str(livesession.video.playlist.lti_id),
                "should_send_reminders": True,
                "username": None,
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_lti_admin_instruct_record_course_diff(self):
        """Admin/instructor can read all livesession belonging to a video."""
        other_consumer_site = ConsumerSiteFactory()
        # livesession with consumer_site
        livesession = LiveSessionFactory(
            consumer_site=other_consumer_site,
            email="admin@openfun.fr",  # explicit to be found in response
            lti_user_id="56255f3807599c377bf0e5bf072359fd",  # explicit to be found in response
            lti_id="Maths",  # explicit to be found in response
        )

        # token with context_id leading to another consumer site
        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=livesession.video,
            context_id=f"{livesession.video.playlist.lti_id}_diff",
            # consumer_site is not other_consumer_site
            consumer_site=str(livesession.video.playlist.consumer_site.id),
            user__email=livesession.email,
            user__id=livesession.lti_user_id,
            user__username=livesession.username,
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "anonymous_id": None,
                "consumer_site": str(other_consumer_site.id),
                "display_name": None,
                "email": "admin@openfun.fr",
                "id": str(livesession.id),
                "is_registered": False,
                "language": "en",
                "live_attendance": None,
                "lti_user_id": "56255f3807599c377bf0e5bf072359fd",
                "lti_id": "Maths",
                "should_send_reminders": True,
                "username": None,
                "video": str(livesession.video.id),
            },
        )

    def test_api_livesession_read_token_public_wrong_video_token(self):
        """Request with wrong video in token and public token."""
        # livesession with no consumer_site
        livesession = AnonymousLiveSessionFactory()

        # token with no context_id leading to the same undefined consumer_site
        jwt_token = ResourceAccessTokenFactory()

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_wrong_video_token(self):
        """Request with wrong video in token and LTI token."""
        # livesession with consumer_site
        livesession = LiveSessionFactory(is_from_lti_connection=True)
        # token with unexisting consumer_site
        jwt_token = LTIResourceAccessTokenFactory(
            context_id=str(livesession.video.playlist.lti_id),
            consumer_site=str(livesession.video.playlist.consumer_site.id),
            user__email=None,
        )
        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_public_other_video_context_none_role(self):
        """Public token can't read another video than the one in the token."""
        # livesession with no consumer_site
        livesession = AnonymousLiveSessionFactory()

        # token with no context_id leading to the same undefined consumer_site
        jwt_token = ResourceAccessTokenFactory(resource=VideoFactory())

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_token_lti_other_video_context_none_role(self):
        """LTI token can't read another video than the one in the token."""
        # livesession with no consumer_site
        livesession = LiveSessionFactory(is_from_lti_connection=True)

        jwt_token = LTIResourceAccessTokenFactory(
            resource=VideoFactory(),  # other video
            context_id=str(livesession.video.playlist.lti_id),
            consumer_site=str(livesession.video.playlist.consumer_site.id),
            user__email=None,
            user__id=str(livesession.lti_user_id),
        )

        response = self.client.get(
            self._get_url(livesession.video, livesession),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 404)

    def test_api_livesession_read_detail_unknown_video(self):
        """Token with wrong resource_id should render a 404."""
        starting_at = timezone.now() + timedelta(days=5)
        video = VideoFactory(live_state=IDLE, live_type=RAW, starting_at=starting_at)
        livesession = AnonymousLiveSessionFactory(video=video)
        # token with no user information
        jwt_token = ResourceAccessTokenFactory()
        response = self.client.get(
            self._get_url(livesession.video, livesession),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 404)


# Old routes to remove
class LiveSessionRetrieveApiOldTest(LiveSessionRetrieveApiTest):
    """Test the retrieve API of the liveSession object using old URLs."""

    def _get_url(self, video, live_session):
        """Return the url to use in tests."""
        return f"/api/livesessions/{live_session.pk}/"
