"""Tests for the Markdown application API."""

import json
import random
import re
import uuid

from django.test import TestCase, override_settings

from rest_framework_simplejwt.tokens import AccessToken

from marsha.core import factories as core_factories

from ..factories import MarkdownDocumentFactory


# We don't enforce arguments documentation in tests
# pylint: disable=unused-argument


@override_settings(MARKDOWN_ENABLED=True)
class MarkdownAPITest(TestCase):
    """Test for the Markdown document API."""

    maxDiff = None

    def test_api_document_fetch_anonymous(self):
        """Anonymous users should not be able to fetch a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        response = self.client.get(f"/api/markdown-documents/{markdown_document.pk}/")
        self.assertEqual(response.status_code, 401)
        content = json.loads(response.content)
        self.assertEqual(
            content, {"detail": "Authentication credentials were not provided."}
        )

    def test_api_document_fetch_student(self):
        """A student should not be allowed to fetch a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = ["student"]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            f"/api/markdown-documents/{markdown_document.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)
        content = json.loads(response.content)
        self.assertEqual(
            content, {"detail": "You do not have permission to perform this action."}
        )

    def test_api_document_fetch_instructor(self):
        """An instructor should be able to fetch a Markdown document."""
        markdown_document = MarkdownDocumentFactory(
            pk="4c51f469-f91e-4998-b438-e31ee3bd3ea6",
            playlist__pk="6a716ff3-1bfb-4870-906e-fda50293f0ac",
            playlist__title="foo",
            playlist__lti_id="course-v1:ufr+mathematics+00001",
            translations__title="Amazing title",
            translations__content="# Heading1\nSome content",
            translations__rendered_content="<h1>Heading1</h1>\n<p>Some content</p>",
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            f"/api/markdown-documents/{markdown_document.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        self.assertEqual(
            content,
            {
                "id": "4c51f469-f91e-4998-b438-e31ee3bd3ea6",
                "is_draft": True,
                "rendering_options": {},
                "translations": [
                    {
                        "language_code": "en",
                        "title": "Amazing title",
                        "content": "# Heading1\nSome content",
                        "rendered_content": "<h1>Heading1</h1>\n<p>Some content</p>",
                    }
                ],
                "playlist": {
                    "id": "6a716ff3-1bfb-4870-906e-fda50293f0ac",
                    "title": "foo",
                    "lti_id": "course-v1:ufr+mathematics+00001",
                },
                "position": 0,
            },
        )

    def test_api_document_fetch_instructor_read_only(self):
        """An instructor should not be able to fetch a Markdown document in read_only."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": False}

        response = self.client.get(
            f"/api/markdown-documents/{markdown_document.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)
        content = json.loads(response.content)
        self.assertEqual(
            content, {"detail": "You do not have permission to perform this action."}
        )

    def test_api_document_fetch_list_anonymous(self):
        """An anonymous should not be able to fetch a list of Markdown document."""
        response = self.client.get("/api/documents/")
        self.assertEqual(response.status_code, 404)

    def test_api_document_fetch_list_student(self):
        """A student should not be able to fetch a list of Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = ["student"]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            "/api/markdown-documents/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )
        self.assertEqual(response.status_code, 404)

    def test_api_fetch_list_instructor(self):
        """An instrustor should not be able to fetch a Markdown document list."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            "/api/markdown-documents/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )
        self.assertEqual(response.status_code, 404)

    def test_api_document_create_anonymous(self):
        """An anonymous should not be able to create a Markdown document."""
        response = self.client.post("/api/markdown-documents/")
        self.assertEqual(response.status_code, 404)

    def test_api_document_create_student(self):
        """A student should not be able to create a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = ["student"]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.post(
            "/api/markdown-documents/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )
        self.assertEqual(response.status_code, 404)

    def test_api_document_create_instructor(self):
        """An instrustor should not be able to create a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            "/api/markdown-documents/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )
        self.assertEqual(response.status_code, 404)

    def test_api_document_delete_anonymous(self):
        """An anonymous should not be able to delete a Markdown document."""
        markdown_document = MarkdownDocumentFactory()
        response = self.client.delete(
            f"/api/markdown-documents/{markdown_document.pk}/",
        )
        self.assertEqual(response.status_code, 401)

    def test_api_document_delete_student(self):
        """A student should not be able to delete a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = ["student"]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.delete(
            f"/api/markdown-documents/{markdown_document.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)

    def test_api_document_delete_instructor(self):
        """An instructor should not be able to create a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.delete(
            f"/api/markdown-documents/{markdown_document.pk}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 405)

    def test_api_document_update_anonymous(self):
        """An anonymous should not be able to update a Markdown document."""
        markdown_document = MarkdownDocumentFactory()
        response = self.client.put(f"/api/documents/{markdown_document.pk}/")
        self.assertEqual(response.status_code, 401)

        response = self.client.patch(
            f"/api/markdown-documents/{markdown_document.pk}/save-translations/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

        response = self.client.post(
            f"/api/markdown-documents/{markdown_document.pk}/latex-rendering/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_api_document_update_student(self):
        """A student user should not be able to update a Markdown document."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = ["student"]
        jwt_token.payload["permissions"] = {"can_update": True}
        data = {"title": "new title"}

        response = self.client.put(
            f"/api/markdown-documents/{markdown_document.pk}/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.patch(
            f"/api/markdown-documents/{markdown_document.pk}/save-translations/",
            data,  # Not important here, wrong data raises 400
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.post(
            f"/api/markdown-documents/{markdown_document.pk}/latex-rendering/",
            data,  # Not important here, wrong data raises 400
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_api_document_update_instructor_read_only(self):
        """An instructor should not be able to update a Markdown document in read_only."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": False}
        data = {"title": "new title"}

        response = self.client.put(
            f"/api/markdown-documents/{markdown_document.pk}/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.patch(
            f"/api/markdown-documents/{markdown_document.pk}/save-translations/",
            data,  # Not important here, wrong data raises 400
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.post(
            f"/api/markdown-documents/{markdown_document.pk}/latex-rendering/",
            data,  # Not important here, wrong data raises 400
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_api_document_update_instructor(self):
        """An instructor should be able to update a Markdown document."""
        markdown_document = MarkdownDocumentFactory(is_draft=True)

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        data = {"is_draft": False}

        response = self.client.put(
            f"/api/markdown-documents/{markdown_document.pk}/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        markdown_document.refresh_from_db()
        self.assertEqual(markdown_document.is_draft, False)

    def test_api_document_translation_update_instructor(self):
        """An instructor should be able to update a Markdown document translated content."""
        markdown_document = MarkdownDocumentFactory(is_draft=True)

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        data = {
            "language_code": "en",
            "title": "A very specific title",
            "content": "Some interesting content for sure",
            "rendered_content": "<p>Some interesting content for sure</p>",
        }

        response = self.client.patch(
            f"/api/markdown-documents/{markdown_document.pk}/save-translations/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        markdown_document.refresh_from_db()
        markdown_document.set_current_language("en")

        self.assertEqual(markdown_document.title, "A very specific title")
        self.assertEqual(markdown_document.content, "Some interesting content for sure")
        self.assertEqual(
            markdown_document.rendered_content,
            "<p>Some interesting content for sure</p>",
        )

    def test_api_document_render_latex_instructor(self):
        """An instructor should be able to render LaTeX content content."""
        markdown_document = MarkdownDocumentFactory(is_draft=True)

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(markdown_document.pk)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.post(
            f"/api/markdown-documents/{markdown_document.pk}/latex-rendering/",
            {"text": r"I = \int \rho R^{2} dV"},
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        # Content is already tested elsewhere
        self.assertIn(
            "<svg version='1.1' xmlns='http://www.w3.org/2000/svg'",
            content["latex_image"],
        )

    def test_api_select_instructor_no_document(self):
        """An instructor should be able to fetch a Markdown document lti select."""
        playlist = core_factories.PlaylistFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = "None"
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        jwt_token.payload["playlist_id"] = str(playlist.id)

        response = self.client.get(
            "/api/markdown-documents/lti-select/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        new_uuid = re.search(
            "http://testserver/lti/markdown_documents/(.*)",
            response.json().get("new_url", ""),
        ).group(1)
        self.assertEqual(uuid.UUID(new_uuid).version, 4)
        self.assertDictEqual(
            {
                "new_url": f"http://testserver/lti/markdown_documents/{new_uuid}",
                "markdown_documents": [],
            },
            response.json(),
        )

    def test_api_select_instructor(self):
        """An instructor should be able to fetch a Markdown document lti select."""
        markdown_document = MarkdownDocumentFactory(
            translations__title="Amazing title",
            translations__content="# Heading1\nSome content",
            translations__rendered_content="<h1>Heading1</h1>\n<p>Some content</p>",
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = "None"
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        jwt_token.payload["playlist_id"] = str(markdown_document.playlist_id)

        response = self.client.get(
            "/api/markdown-documents/lti-select/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        new_uuid = re.search(
            "http://testserver/lti/markdown_documents/(.*)",
            response.json().get("new_url", ""),
        ).group(1)
        self.assertEqual(uuid.UUID(new_uuid).version, 4)
        self.assertDictEqual(
            {
                "new_url": f"http://testserver/lti/markdown_documents/{new_uuid}",
                "markdown_documents": [
                    {
                        "id": str(markdown_document.id),
                        "is_draft": markdown_document.is_draft,
                        "lti_id": str(markdown_document.lti_id),
                        "lti_url": (
                            f"http://testserver/lti/markdown_documents/{str(markdown_document.id)}"
                        ),
                        "rendering_options": {},
                        "translations": [
                            {
                                "language_code": "en",
                                "title": "Amazing title",
                                "content": "# Heading1\nSome content",
                                "rendered_content": "<h1>Heading1</h1>\n<p>Some content</p>",
                            }
                        ],
                        "playlist": {
                            "id": str(markdown_document.playlist_id),
                            "title": markdown_document.playlist.title,
                            "lti_id": markdown_document.playlist.lti_id,
                        },
                        "position": markdown_document.position,
                    },
                ],
            },
            response.json(),
        )