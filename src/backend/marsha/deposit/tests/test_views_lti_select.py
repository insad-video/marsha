"""Test the LTI select view."""
from html import unescape
import json
import random
import re

from django.test import TestCase, override_settings

from marsha.core.factories import PlaylistFactory
from marsha.core.tests.testing_utils import generate_passport_and_signed_lti_parameters
from marsha.core.utils.lti_select_utils import get_lti_select_resources

from ..factories import FileDepositoryFactory


# We don't enforce arguments documentation in tests
# pylint: disable=unused-argument,too-many-lines


class SelectLTIViewTestCase(TestCase):
    """Test the select LTI view in the ``core`` app of the Marsha project."""

    maxDiff = None

    def setUp(self):
        super().setUp()
        get_lti_select_resources.cache_clear()

    @override_settings(DEPOSIT_ENABLED=True)
    def test_views_lti_select_deposit_enabled(self):
        """Frontend context flag should be enabled when flag is enabled."""
        lti_consumer_parameters = {
            "roles": random.choice(["instructor", "administrator"]),
            "content_item_return_url": "https://lti-consumer.site/lti",
            "context_id": "sent_lti_context_id",
        }
        lti_parameters, passport = generate_passport_and_signed_lti_parameters(
            url="http://testserver/lti/select/",
            lti_parameters=lti_consumer_parameters,
        )

        playlist = PlaylistFactory(
            lti_id=lti_parameters.get("context_id"),
            consumer_site=passport.consumer_site,
        )
        file_depository = FileDepositoryFactory(playlist=playlist)

        response = self.client.post(
            "/lti/select/",
            lti_parameters,
            HTTP_REFERER="http://testserver",
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "<html>")

        match = re.search(
            '<div id="marsha-frontend-data" data-context="(.*)">',
            response.content.decode("utf-8"),
        )
        context = json.loads(unescape(match.group(1)))

        self.assertTrue(context.get("flags").get("deposit"))
        self.assertEqual(
            context.get("deposits")[0].get("lti_url"),
            f"http://testserver/lti/filedepositories/{file_depository.id}",
        )

    @override_settings(DEPOSIT_ENABLED=False)
    def test_views_lti_select_deposit_disabled(self):
        """Frontend context flag should be disabled when flag is disabled."""
        lti_consumer_parameters = {
            "roles": random.choice(["instructor", "administrator"]),
            "content_item_return_url": "https://lti-consumer.site/lti",
            "context_id": "sent_lti_context_id",
        }
        lti_parameters, _ = generate_passport_and_signed_lti_parameters(
            url="http://testserver/lti/select/",
            lti_parameters=lti_consumer_parameters,
        )

        response = self.client.post(
            "/lti/select/",
            lti_parameters,
            HTTP_REFERER="http://testserver",
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "<html>")

        match = re.search(
            '<div id="marsha-frontend-data" data-context="(.*)">',
            response.content.decode("utf-8"),
        )
        context = json.loads(unescape(match.group(1)))

        self.assertFalse(context.get("flags").get("deposit"))
        self.assertIsNone(context.get("deposits"))
