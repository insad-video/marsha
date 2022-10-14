"""Tests for the Markdown image create API."""
import json

from django.test import TestCase

from marsha.core.simple_jwt.factories import (
    InstructorOrAdminLtiTokenFactory,
    StudentLtiTokenFactory,
)
from marsha.markdown.factories import MarkdownDocumentFactory, MarkdownImageFactory
from marsha.markdown.models import MarkdownImage


class MarkdownImageCreateApiTest(TestCase):
    """Test the create API of the Markdown image object."""

    maxDiff = None

    def test_api_markdown_image_create_anonymous(self):
        """Anonymous users should not be able to create a Markdown image."""
        response = self.client.post("/api/markdown-images/")
        self.assertEqual(response.status_code, 401)

    def test_api_markdown_image_create_student(self):
        """Student users should not be able to create a Markdown image."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = StudentLtiTokenFactory(resource=markdown_document)

        response = self.client.post(
            "/api/markdown-images/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )

        self.assertEqual(response.status_code, 403)

    def test_api_markdown_image_create_instructor(self):
        """Student users should not be able to create a Markdown image."""
        markdown_document = MarkdownDocumentFactory()

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=markdown_document)

        response = self.client.post(
            "/api/markdown-images/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )

        self.assertEqual(response.status_code, 201)
        content = json.loads(response.content)
        created_markdown_image = MarkdownImage.objects.last()

        self.assertEqual(
            content,
            {
                "id": str(created_markdown_image.id),
                "filename": None,
                "active_stamp": None,
                "is_ready_to_show": False,
                "upload_state": "pending",
                "url": None,
                "markdown_document": str(markdown_document.id),
            },
        )

    def test_api_markdown_image_create_already_existing_instructor(self):
        """
        Creating a Markdown image should not fail when a Markdown image already exists
        for the Markdown document.
        """
        markdown_document = MarkdownDocumentFactory()
        MarkdownImageFactory(markdown_document=markdown_document)

        jwt_token = InstructorOrAdminLtiTokenFactory(resource=markdown_document)

        response = self.client.post(
            "/api/markdown-images/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )

        self.assertEqual(response.status_code, 201)
        content = json.loads(response.content)

        self.assertIsNotNone(content.pop("id"))  # we don't test the generated ID here

        self.assertEqual(
            content,
            {
                "active_stamp": None,
                "filename": None,
                "is_ready_to_show": False,
                "markdown_document": str(markdown_document.id),
                "upload_state": "pending",
                "url": None,
            },
        )

    def test_api_markdown_image_instructor_create_in_read_only(self):
        """Instructor should not be able to create Markdown images in a read_only mode."""
        markdown_image = MarkdownImageFactory()

        jwt_token = InstructorOrAdminLtiTokenFactory(
            resource=markdown_image.markdown_document,
            permissions__can_update=False,
        )

        response = self.client.post(
            "/api/markdown-images/", HTTP_AUTHORIZATION=f"Bearer {jwt_token}"
        )

        self.assertEqual(response.status_code, 403)