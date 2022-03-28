# Generated by Django 4.0.2 on 2022-04-22 16:34

import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

import parler.fields
import parler.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("core", "0045_add_livesession_language"),
    ]

    operations = [
        migrations.CreateModel(
            name="MarkdownDocument",
            fields=[
                ("deleted", models.DateTimeField(editable=False, null=True)),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        help_text="primary key for the record as UUID",
                        primary_key=True,
                        serialize=False,
                        verbose_name="id",
                    ),
                ),
                (
                    "created_on",
                    models.DateTimeField(
                        default=django.utils.timezone.now,
                        editable=False,
                        help_text="date and time at which a record was created",
                        verbose_name="created on",
                    ),
                ),
                (
                    "updated_on",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="date and time at which a record was last updated",
                        verbose_name="updated on",
                    ),
                ),
                (
                    "lti_id",
                    models.CharField(
                        blank=True,
                        help_text="ID for synchronization with an external LTI tool",
                        max_length=255,
                        null=True,
                        verbose_name="lti id",
                    ),
                ),
                (
                    "position",
                    models.PositiveIntegerField(
                        default=0,
                        help_text="position of this file in the playlist",
                        verbose_name="position",
                    ),
                ),
                (
                    "is_public",
                    models.BooleanField(
                        default=False,
                        help_text="Is the Markdown document publicly accessible?",
                        verbose_name="is Markdown document public",
                    ),
                ),
                (
                    "is_draft",
                    models.BooleanField(
                        default=True,
                        help_text="Is the Markdown document a draft?",
                        verbose_name="is Markdown document still a draft",
                    ),
                ),
                (
                    "rendering_options",
                    models.JSONField(
                        blank=True,
                        default=dict,
                        help_text="Markdown rendering options are use by the frontend's markdown to HTML renderer",
                        verbose_name="Markdown rendering options",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        help_text="author of the file",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_%(class)s",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="author",
                    ),
                ),
                (
                    "duplicated_from",
                    models.ForeignKey(
                        blank=True,
                        help_text="original file this one was duplicated from",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="duplicates",
                        to="markdown.markdowndocument",
                        verbose_name="duplicated from",
                    ),
                ),
                (
                    "playlist",
                    models.ForeignKey(
                        help_text="playlist to which this file belongs",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="%(class)ss",
                        to="core.playlist",
                        verbose_name="playlist",
                    ),
                ),
            ],
            options={
                "verbose_name": "Markdown document",
                "verbose_name_plural": "Markdown documents",
                "db_table": "md_document",
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name="MarkdownDocumentTranslation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language_code",
                    models.CharField(
                        db_index=True, max_length=15, verbose_name="Language"
                    ),
                ),
                (
                    "title",
                    models.CharField(
                        help_text="Markdown document's title",
                        max_length=255,
                        verbose_name="title",
                    ),
                ),
                (
                    "content",
                    models.TextField(
                        blank=True,
                        help_text="The document Markdown formatted content",
                        verbose_name="Markdown document content",
                    ),
                ),
                (
                    "rendered_content",
                    models.TextField(
                        blank=True,
                        help_text="The Markdown document formatted content for students",
                        verbose_name="Markdown document rendered content",
                    ),
                ),
                (
                    "master",
                    parler.fields.TranslationsForeignKey(
                        editable=False,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="translations",
                        to="markdown.markdowndocument",
                    ),
                ),
            ],
            options={
                "verbose_name": "Markdown document Translation",
                "db_table": "md_document_translation",
                "db_tablespace": "",
                "managed": True,
                "default_permissions": (),
                "unique_together": {("language_code", "master")},
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
        migrations.AddConstraint(
            model_name="markdowndocument",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted", None)),
                fields=("lti_id", "playlist"),
                name="markdown_document_unique_idx",
            ),
        ),
    ]