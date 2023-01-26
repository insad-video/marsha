"""Django settings for marsha project.

Uses django-configurations to manage environments inheritance and the loading of some
config from the environment

"""
# pylint: disable=abstract-class-instantiated

from datetime import timedelta
import json
import os

from django.utils.translation import gettext_lazy as _

from configurations import Configuration, values
from corsheaders.defaults import default_headers
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

from marsha.account.social_pipeline import MARSHA_DEFAULT_AUTH_PIPELINE


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def get_release():
    """
    Get the current release of the application.

    By release, we mean the release from the version.json file à la Mozilla [1]
    (if any). If this file has not been found, it defaults to "NA".
    [1]
    https://github.com/mozilla-services/Dockerflow/blob/master/docs/version_object.md
    """
    # Try to get the current release from the version.json file generated by the
    # CI during the Docker image build
    try:
        with open(os.path.join(BASE_DIR, "version.json"), encoding="utf8") as version:
            return json.load(version)["version"]
    except FileNotFoundError:
        return "NA"  # Default: not available


class Base(Configuration):
    """Base configuration every configuration (aka environment) should inherit from.

    It depends on an environment variable that SHOULD be defined:
    - DJANGO_SECRET_KEY

    You may also want to override default configuration by setting the following
    environment variables:
    - DJANGO_DEBUG
    """

    DATA_DIR = values.Value(os.path.join("/", "data"))

    # Static files (CSS, JavaScript, Images)
    BASE_STATIC_DIR = os.path.join(BASE_DIR, "static")
    STATICFILES_DIRS = (BASE_STATIC_DIR,)
    STATIC_URL = "/static/"
    MEDIA_URL = "/media/"
    # Allow to configure location of static/media files for non-Docker installation
    MEDIA_ROOT = values.Value(os.path.join(str(DATA_DIR), "media"))
    STATIC_ROOT = values.Value(os.path.join(str(DATA_DIR), "static"))

    SECRET_KEY = values.SecretValue()

    DEBUG = values.BooleanValue(False)

    DATABASES = {
        "default": {
            "ENGINE": values.Value(
                "django.db.backends.postgresql",
                environ_name="DATABASE_ENGINE",
                environ_prefix=None,
            ),
            "NAME": values.Value(
                "marsha", environ_name="POSTGRES_DB", environ_prefix=None
            ),
            "USER": values.Value(
                "marsha_user", environ_name="POSTGRES_USER", environ_prefix=None
            ),
            "PASSWORD": values.Value(
                "pass", environ_name="POSTGRES_PASSWORD", environ_prefix=None
            ),
            "HOST": values.Value(
                "localhost", environ_name="POSTGRES_HOST", environ_prefix=None
            ),
            "PORT": values.Value(
                5432, environ_name="POSTGRES_PORT", environ_prefix=None
            ),
        }
    }

    ALLOWED_HOSTS = []

    SITE_ID = 1

    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_REFERRER_POLICY = "same-origin"
    SILENCED_SYSTEM_CHECKS = values.ListValue([])
    CSRF_TRUSTED_ORIGINS = values.ListValue([])
    SECURE_PROXY_SSL_HEADER = values.TupleValue(None)

    # Application definition

    INSTALLED_APPS = [
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.sites",
        "django.contrib.staticfiles",
        "django_extensions",
        "django_filters",
        "dockerflow.django",
        "waffle",
        "rest_framework",
        "drf_spectacular",
        "corsheaders",
        "channels",
        "dj_rest_auth",  # authentication through DRF
        "parler",  # django-parler, for translated models
        "rest_framework_simplejwt.token_blacklist",
        "social_django.apps.PythonSocialAuthConfig",  # python-social-auth for Django
        "social_edu_federation.django.apps.PythonSocialEduFedAuthConfig",
        # Marsha
        "marsha.account.apps.AccountConfig",
        "marsha.core.apps.MarshaAdminConfig",
        "marsha.core.apps.CoreConfig",
        "marsha.bbb.apps.BbbConfig",
        "marsha.deposit.apps.DepositConfig",
        "marsha.markdown.apps.MarkdownConfig",
        "marsha.websocket.apps.WebsocketConfig",
    ]
    MIDDLEWARE = [
        "corsheaders.middleware.CorsMiddleware",
        "django.middleware.security.SecurityMiddleware",
        "whitenoise.middleware.WhiteNoiseMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.locale.LocaleMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
        "dockerflow.django.middleware.DockerflowMiddleware",
        "waffle.middleware.WaffleMiddleware",
        "social_django.middleware.SocialAuthExceptionMiddleware",
    ]

    ROOT_URLCONF = "marsha.urls"

    TEMPLATES = [
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": [],
            "APP_DIRS": True,
            "OPTIONS": {
                "context_processors": [
                    "django.template.context_processors.debug",
                    "django.template.context_processors.request",
                    "django.contrib.auth.context_processors.auth",
                    "django.contrib.messages.context_processors.messages",
                    "social_django.context_processors.backends",
                    "social_django.context_processors.login_redirect",
                ]
            },
        }
    ]

    AUTH_USER_MODEL = "core.User"

    AUTHENTICATION_BACKENDS = [
        "social_edu_federation.backends.saml_fer.FERSAMLAuth",
        "django.contrib.auth.backends.ModelBackend",
    ]

    ASGI_APPLICATION = "marsha.asgi.application"

    # For sentinels:
    # CHANNEL_LAYERS = {
    #     "default": {
    #         "BACKEND": "marsha.websocket.layers.JsonRedisChannelLayer",
    #         "CONFIG": {
    #             "hosts": [{
    #                 "sentinels": [(SENTINEL_HOST, SENTINEL_PORT)],
    #                 "master_name": SENTINEL_MASTER,
    #             }],
    #         },
    #     },
    # }
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "marsha.websocket.layers.JsonRedisChannelLayer",
            "CONFIG": {
                "hosts": values.ListValue(
                    [("redis", 6379)], environ_name="REDIS_HOST", environ_prefix=None
                ),
            },
        },
    }

    REST_FRAMEWORK = {
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "marsha.core.simple_jwt.authentication.JWTStatelessUserOrResourceAuthentication",
        ),
        "EXCEPTION_HANDLER": "marsha.core.views.exception_handler",
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
        "PAGE_SIZE": 50,
        "DEFAULT_FILTER_BACKENDS": [
            "django_filters.rest_framework.DjangoFilterBackend"
        ],
        "DEFAULT_THROTTLE_RATES": {
            "anon": values.Value(
                "3/minute", environ_name="REST_FRAMEWORK_ANON_THROTTLE_RATE"
            ),
            "dj_rest_auth": values.Value(
                "3/minute", environ_name="REST_FRAMEWORK_REST_AUTH_THROTTLE_RATE"
            ),
            "live_session": values.Value(
                "3/minute", environ_name="REST_FRAMEWORK_LIVE_SESSION_THROTTLE_RATE"
            ),
        },
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    }

    # DRF SPECTACULAR
    SPECTACULAR_SETTINGS = {
        "TITLE": "Marsha API",
        "SERVE_INCLUDE_SCHEMA": False,
    }

    # Django Rest Auth
    OLD_PASSWORD_FIELD_ENABLED = True
    REST_SESSION_LOGIN = False  # consider LOGOUT_ON_PASSWORD_CHANGE if changing this
    REST_USE_JWT = True
    REST_AUTH_TOKEN_MODEL = None
    REST_AUTH_SERIALIZERS = {
        "PASSWORD_CHANGE_SERIALIZER": "marsha.account.serializers.PasswordChangeSerializer",
        "PASSWORD_RESET_SERIALIZER": "marsha.account.serializers.PasswordResetSerializer",
    }

    # WAFFLE
    WAFFLE_CREATE_MISSING_SWITCHES = True

    # User login base Django settings
    LOGIN_REDIRECT_URL = "account:login_complete_redirect"

    FRONTEND_HOME_URL = values.URLValue("http://localhost:3000/")
    CHALLENGE_TOKEN_LIFETIME = timedelta(
        seconds=values.IntegerValue(
            default=60,
            environ_name="CHALLENGE_TOKEN_LIFETIME",
        ),
    )
    # Specfic access token lifetime
    LTI_SELECT_FORM_ACCESS_TOKEN_LIFETIME = timedelta(
        seconds=values.IntegerValue(
            default=86400,
            environ_name="LTI_SELECT_FORM_ACCESS_TOKEN_LIFETIME",
        ),
    )
    LTI_USER_TOKEN_LIFETIME = timedelta(
        seconds=values.IntegerValue(
            default=86400,
            environ_name="LTI_USER_TOKEN_LIFETIME",
        ),
    )

    # Password validation
    # https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators
    AUTH_PASSWORD_VALIDATORS = [
        {
            "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
        },
        {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
        {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
        {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
    ]

    JWT_SIGNING_KEY = values.Value(SECRET_KEY)

    # Internationalization
    # https://docs.djangoproject.com/en/2.0/topics/i18n/

    # Django sets `LANGUAGES` by default with all supported languages. Let's save it to a
    # different setting before overriding it with the languages active in Marsha. We can use it
    # for example for the choice of time text tracks languages which should not be limited to
    # the few languages active in Marsha.
    # pylint: disable=no-member
    ALL_LANGUAGES = Configuration.LANGUAGES

    LANGUAGE_CODE = "en-us"

    # Careful! Languages should be ordered by priority, as this tuple is used to get
    # fallback/default languages throughout the app.
    # Use "en" as default as it is the language that is most likely to be spoken by any visitor
    # when their preferred language, whatever it is, is unavailable
    LANGUAGES = [("en", _("english")), ("fr", _("french"))]
    LANGUAGES_DICT = dict(LANGUAGES)
    LOCALE_PATHS = (os.path.join(BASE_DIR, "../locale"),)
    # Internationalization
    TIME_ZONE = "UTC"
    USE_I18N = True
    USE_L10N = True
    USE_TZ = True

    REACT_LOCALES = values.ListValue(["en_US", "es_ES", "fr_FR", "fr_CA"])
    DEFAULT_LTI_LAUNCH_PRESENTATION_LOCALE = values.Value("en")

    PARLER_DEFAULT_LANGUAGE_CODE = LANGUAGES[0][0]
    PARLER_LANGUAGES = {
        None: tuple({"code": code} for code in LANGUAGES_DICT.keys()),
        "default": {
            "fallbacks": [
                PARLER_DEFAULT_LANGUAGE_CODE
            ],  # defaults to PARLER_DEFAULT_LANGUAGE_CODE
            "hide_untranslated": False,
        },
    }
    # Admin tabs don't show up when only Site `None` is defined
    PARLER_LANGUAGES[SITE_ID] = PARLER_LANGUAGES[None]

    VIDEO_RESOLUTIONS = [144, 240, 480, 720, 1080]
    STORAGE_BACKEND = values.Value("marsha.core.storage.s3")

    # Logging
    LOGGING = values.DictValue(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "loggers": {
                "marsha": {"handlers": ["console"], "level": "INFO", "propagate": True},
            },
        }
    )

    # AWS
    AWS_ACCESS_KEY_ID = values.SecretValue()
    AWS_SECRET_ACCESS_KEY = values.SecretValue()
    AWS_S3_REGION_NAME = values.Value("eu-west-1")
    AWS_S3_URL_PROTOCOL = values.Value("https")
    AWS_BASE_NAME = values.Value()
    UPDATE_STATE_SHARED_SECRETS = values.ListValue()
    AWS_UPLOAD_EXPIRATION_DELAY = values.Value(24 * 60 * 60)  # 24h
    AWS_MEDIALIVE_ROLE_ARN = values.SecretValue()
    AWS_MEDIAPACKAGE_HARVEST_JOB_ARN = values.SecretValue()
    AWS_MEDIALIVE_INPUT_WAITER_DELAY = values.PositiveIntegerValue(5)
    AWS_MEDIALIVE_INPUT_WAITER_MAX_ATTEMPTS = values.PositiveIntegerValue(84)

    # LTI Config
    LTI_CONFIG_TITLE = values.Value("Marsha")
    LTI_CONFIG_DESCRIPTION = values.Value(
        "An LTI first, opensource and extensible Learning Content Management System"
    )
    LTI_CONFIG_ICON = values.Value("marsha_32x32_blue.png")
    LTI_CONFIG_URL = values.Value()
    LTI_CONFIG_CONTACT_EMAIL = values.Value()

    # BBB
    BBB_ENABLED = values.BooleanValue(False)
    BBB_API_ENDPOINT = values.Value()
    BBB_API_SECRET = values.Value(None)
    BBB_API_CALLBACK_SECRET = values.Value(None)
    BBB_API_TIMEOUT = values.PositiveIntegerValue(10)
    BBB_ENABLE_RECORD = values.BooleanValue(False)
    ALLOWED_CLASSROOM_DOCUMENT_MIME_TYPES = values.ListValue(["application/pdf"])
    BBB_INVITE_JWT_DEFAULT_DAYS_DURATION = values.PositiveIntegerValue(30)

    # deposit application
    DEPOSIT_ENABLED = values.BooleanValue(False)

    # Markdown application
    MARKDOWN_ENABLED = values.BooleanValue(False)
    ALLOWED_MARKDOWN_IMAGES_MIME_TYPES = [
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/tiff",
        "image/webp",
    ]

    # LIVE_RAW
    LIVE_RAW_ENABLED = values.BooleanValue(False)

    # Cloud Front key pair for signed urls
    CLOUDFRONT_PRIVATE_KEY_PATH = values.Value(
        os.path.join(BASE_DIR, "..", ".ssh", "cloudfront_private_key")
    )
    CLOUDFRONT_SIGNED_URLS_ACTIVE = values.BooleanValue(True)
    CLOUDFRONT_SIGNED_URLS_VALIDITY = 2 * 60 * 60  # 2 hours
    CLOUDFRONT_SIGNED_URL_CACHE_DURATION = values.Value(900)  # 15 minutes
    CLOUDFRONT_SIGNED_PUBLIC_KEY_ID = values.Value(None)

    CLOUDFRONT_DOMAIN = values.Value(None)

    BYPASS_LTI_VERIFICATION = values.BooleanValue(False)

    # Cache
    APP_DATA_CACHE_DURATION = values.Value(60)  # 60 secondes
    VIDEO_ATTENDANCES_CACHE_DURATION = values.Value(300)  # 5 minutes

    SENTRY_DSN = values.Value(None)

    # Resource max file size
    DOCUMENT_SOURCE_MAX_SIZE = values.PositiveIntegerValue(2**30)  # 1GB
    VIDEO_SOURCE_MAX_SIZE = values.PositiveIntegerValue(2**30)  # 1GB
    SUBTITLE_SOURCE_MAX_SIZE = values.PositiveIntegerValue(2**20)  # 1MB
    THUMBNAIL_SOURCE_MAX_SIZE = values.PositiveIntegerValue(10 * (2**20))  # 10MB
    SHARED_LIVE_MEDIA_SOURCE_MAX_SIZE = values.PositiveIntegerValue(
        300 * (2**20)
    )  # 300MB
    MARKDOWN_IMAGE_SOURCE_MAX_SIZE = values.PositiveIntegerValue(10 * (2**20))  # 10MB
    DEPOSITED_FILE_SOURCE_MAX_SIZE = values.PositiveIntegerValue(2**30)  # 1GB
    CLASSROOM_DOCUMENT_SOURCE_MAX_SIZE = values.PositiveIntegerValue(
        300 * (2**20)
    )  # 300MB

    EXTERNAL_JAVASCRIPT_SCRIPTS = values.ListValue([])

    VIDEO_PLAYER = values.Value("videojs")
    FRONT_UPLOAD_POLL_INTERVAL = values.Value("60")

    MAINTENANCE_MODE = values.BooleanValue(False)

    # XMPP Settings
    LIVE_CHAT_ENABLED = values.BooleanValue(False)
    XMPP_BOSH_URL = values.Value(None)
    XMPP_CONVERSE_PERSISTENT_STORE = values.Value("localStorage")
    XMPP_WEBSOCKET_URL = values.Value(None)
    XMPP_CONFERENCE_DOMAIN = values.Value(None)
    XMPP_PRIVATE_ADMIN_JID = values.Value(None)
    XMPP_PRIVATE_SERVER_PORT = values.Value(5222)
    XMPP_PRIVATE_SERVER_PASSWORD = values.Value(None)
    XMPP_JWT_SHARED_SECRET = values.Value(None)
    XMPP_JWT_ISSUER = values.Value("marsha")
    XMPP_JWT_AUDIENCE = values.Value("marsha")
    XMPP_DOMAIN = values.Value(None)

    # LIVE SETTINGS
    NB_DAYS_BEFORE_DELETING_LIVE_RECORDINGS = values.Value(14)
    NB_DAYS_BEFORE_DELETING_AWS_ELEMENTAL_STACK = values.Value(14)
    NB_SECONDS_LIVING_DEV_STACK = values.PositiveIntegerValue(600)
    LIVE_PLAYLIST_WINDOW_SECONDS = values.PositiveIntegerValue(10)
    LIVE_SEGMENT_DURATION_SECONDS = values.PositiveIntegerValue(4)
    LIVE_FRAMERATE_NUMERATOR = values.PositiveIntegerValue(24000)
    LIVE_FRAMERATE_DENOMINATOR = values.PositiveIntegerValue(1000)
    LIVE_GOP_SIZE = values.FloatValue(4)

    # JITSI SETTINGS
    JITSI_EXTERNAL_API_URL = values.Value("https://meet.jit.si/external_api.js")
    JITSI_DOMAIN = values.Value("meet.jit.si")
    JITSI_CONFIG_OVERWRITE = values.DictValue({})
    JITSI_INTERFACE_CONFIG_OVERWRITE = values.DictValue({})
    JITSI_JWT_APP_ID = values.Value()
    JITSI_JWT_APP_SECRET = values.Value()
    JITSI_JWT_TOKEN_EXPIRATION_SECONDS = values.PositiveIntegerValue(600)

    # LIVE PAIRING
    LIVE_PAIRING_EXPIRATION_SECONDS = 60

    # SHARED LIVE MEDIA SETTINGS
    ALLOWED_SHARED_LIVE_MEDIA_MIME_TYPES = values.ListValue(["application/pdf"])

    # Cors
    CORS_ALLOW_ALL_ORIGINS = values.BooleanValue(False)
    CORS_ALLOWED_ORIGINS = values.ListValue([])
    CORS_ALLOWED_ORIGIN_REGEXES = values.ListValue([])
    CORS_URLS_REGEX = values.Value(r"^/api/.*$")
    CORS_ALLOW_METHODS = values.ListValue(["POST", "OPTIONS"])
    CORS_ALLOW_HEADERS = values.ListValue(list(default_headers))

    # Mail
    EMAIL_BACKEND = values.Value("django.core.mail.backends.smtp.EmailBackend")
    EMAIL_HOST = values.Value(None)
    EMAIL_HOST_USER = values.Value(None)
    EMAIL_HOST_PASSWORD = values.Value(None)
    EMAIL_PORT = values.PositiveIntegerValue(None)
    EMAIL_USE_TLS = values.BooleanValue(False)
    EMAIL_FROM = values.Value("from@fun-mooc.fr")

    # REMINDERS SENT for scheduled webinars
    REMINDER_1, REMINDER_2, REMINDER_3, REMINDER_DATE_UPDATED, REMINDER_ERROR = (
        "REMINDER_1",
        "REMINDER_2",
        "REMINDER_3",
        "REMINDER_DATE_UPDATED",
        "REMINDER_ERROR",
    )
    # keys for REMINDERS_STEP
    (
        REMINDER_ELAPSED_LABEL,
        REGISTER_EXCLUDE_STEP,
        REMINDER_KEY_REGISTER_BEFORE_S,
        REMINDER_KEY_STARTS_IN_S,
        REMINDER_OBJECT_MAIL,
    ) = (
        "REMINDER_ELAPSED_LABEL",
        "REGISTER_EXCLUDE_STEP",
        "STARTS_IN_S",
        "REGISTER_BEFORE_S",
        "REMINDER_OBJECT_MAIL",
    )
    REMINDERS_STEP = values.DictValue(
        {
            REMINDER_1: {
                REMINDER_ELAPSED_LABEL: _("5 minutes"),
                REGISTER_EXCLUDE_STEP: [],
                REMINDER_KEY_STARTS_IN_S: 300,  # webinar starts in less than 5 minutes
                REMINDER_KEY_REGISTER_BEFORE_S: 10800,  # three hours before
                REMINDER_OBJECT_MAIL: _("Live starts in less than 5 minutes"),
            },
            REMINDER_2: {
                REMINDER_ELAPSED_LABEL: _("3 hours"),
                REGISTER_EXCLUDE_STEP: [
                    REMINDER_1
                ],  # if step REMINDER_1 is done it will cancel this one
                REMINDER_KEY_REGISTER_BEFORE_S: 86400,  # 1 day before in seconds
                REMINDER_KEY_STARTS_IN_S: 10800,  # webinar starts in less than 3 hours
                REMINDER_OBJECT_MAIL: _("Live starts in less than 3 hours"),
            },
            REMINDER_3: {
                REMINDER_ELAPSED_LABEL: _("3 days"),
                REGISTER_EXCLUDE_STEP: [REMINDER_1, REMINDER_2],
                REMINDER_KEY_REGISTER_BEFORE_S: 30 * 86400,  # thirty days before
                REMINDER_KEY_STARTS_IN_S: 3
                * 86400,  # webinar starts in less than 3 days
                REMINDER_OBJECT_MAIL: _("Live starts in less than 3 days"),
            },
        }
    )
    REMINDERS_SECRET = values.Value()

    # Settings related to statistics in potsie project
    STAT_BACKEND = values.Value("marsha.core.stats.grafana_xapi_fun_backend")
    STAT_BACKEND_SETTINGS = values.DictValue(
        {
            "api_key": values.Value(
                environ_name="GRAFANA_XAPI_FUN_API_KEY", environ_prefix=None
            ),
            "api_endpoint": values.Value(
                environ_name="GRAFANA_XAPI_FUN_API_ENDPOINT", environ_prefix=None
            ),
            "api_datasource_id": values.Value(
                environ_name="GRAFANA_XAPI_FUN_API_DATASOURCE_ID", environ_prefix=None
            ),
            "api_datastream": values.Value(
                environ_name="GRAFANA_XAPI_FUN_API_DATASTREAM", environ_prefix=None
            ),
        }
    )
    STAT_BACKEND_TIMEOUT = values.PositiveIntegerValue(10)
    ATTENDANCE_POINTS = values.Value(20)
    ATTENDANCE_PUSH_DELAY = values.Value(60)

    # Python social auth
    SOCIAL_AUTH_JSONFIELD_ENABLED = True
    SOCIAL_AUTH_URL_NAMESPACE = "account:social"
    SOCIAL_AUTH_SAML_FER_IDP_FAKER = False
    SOCIAL_AUTH_SAML_FER_IDP_FAKER_DOCKER_PORT = 8060
    SOCIAL_AUTH_SAML_FER_FEDERATION_SAML_METADATA_STORE = (
        "social_edu_federation.django.metadata_store.CachedMetadataStore"
    )
    SOCIAL_AUTH_SAML_FER_REDIRECT_IS_HTTPS = values.BooleanValue(False)

    SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG = {
        "authnRequestsSigned": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_AUTH_REQUEST_SIGNED",
        ),
        "signMetadata": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_SIGN_METADATA",
        ),
        "wantMessagesSigned": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_WANT_MESSAGES_SIGNED",
        ),
        "wantAssertionsSigned": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_WANT_ASSERTIONS_SIGNED",
        ),
        "wantAssertionsEncrypted": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_WANT_ASSERTIONS_ENCRYPTED",
        ),
        "rejectDeprecatedAlgorithm": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_REJECT_DEPRECATED_ALGORITHM",
        ),
        "wantNameId": values.BooleanValue(
            default=True,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_WANT_NAME_ID",
        ),
        "allowRepeatAttributeName": values.BooleanValue(
            default=False,
            environ_name="SOCIAL_AUTH_SAML_FER_SECURITY_CONFIG_ALLOW_REPEAT_ATTRIBUTE_NAME",
        ),
    }

    # SOCIAL_AUTH_SAML_FER_SP_ENTITY_ID should be a URL that includes a domain name you own
    SOCIAL_AUTH_SAML_FER_SP_ENTITY_ID = values.Value()
    # SOCIAL_AUTH_SAML_FER_SP_PUBLIC_CERT X.509 certificate for the key pair that
    # your app will use
    SOCIAL_AUTH_SAML_FER_SP_PUBLIC_CERT = values.Value()
    # SOCIAL_AUTH_SAML_FER_SP_PRIVATE_KEY The private key to be used by your app
    SOCIAL_AUTH_SAML_FER_SP_PRIVATE_KEY = values.Value()

    # Next certificate management, keep empty when next certificate is still not known
    SOCIAL_AUTH_SAML_FER_SP_NEXT_PUBLIC_CERT = values.Value()
    SOCIAL_AUTH_SAML_FER_SP_EXTRA = (
        {
            "x509certNew": SOCIAL_AUTH_SAML_FER_SP_NEXT_PUBLIC_CERT,
        }
        if SOCIAL_AUTH_SAML_FER_SP_NEXT_PUBLIC_CERT
        else {}
    )

    SOCIAL_AUTH_SAML_FER_ORG_INFO = {  # specify values for English at a minimum
        "en-US": {
            "name": values.Value(
                "marsha",
                environ_name="SOCIAL_AUTH_SAML_FER_ORG_INFO_NAME",
            ),
            "displayname": values.Value(
                "Marsha",
                environ_name="SOCIAL_AUTH_SAML_FER_ORG_INFO_DISPLAY_NAME",
            ),
            "url": values.Value(
                environ_name="SOCIAL_AUTH_SAML_FER_ORG_INFO_URL",
            ),
        }
    }
    # SOCIAL_AUTH_SAML_FER_TECHNICAL_CONTACT technical contact responsible for your app
    SOCIAL_AUTH_SAML_FER_TECHNICAL_CONTACT = {
        "givenName": values.Value(
            "Marsha dev team",
            environ_name="SOCIAL_AUTH_SAML_FER_TECHNICAL_CONTACT_NAME",
        ),
        "emailAddress": values.Value(
            environ_name="SOCIAL_AUTH_SAML_FER_TECHNICAL_CONTACT_EMAIL",
        ),
    }
    # SOCIAL_AUTH_SAML_FER_SUPPORT_CONTACT support contact for your app
    SOCIAL_AUTH_SAML_FER_SUPPORT_CONTACT = {
        "givenName": values.Value(
            "Marsha dev team",
            environ_name="SOCIAL_AUTH_SAML_FER_SUPPORT_CONTACT_NAME",
        ),
        "emailAddress": values.Value(
            environ_name="SOCIAL_AUTH_SAML_FER_SUPPORT_CONTACT_EMAIL",
        ),
    }
    # SOCIAL_AUTH_SAML_FER_ENABLED_IDPS is not required since the
    # SAML FER backend is overridden to allow dynamic IdPs.
    # see social_edu_federation.backends.saml_fer.FERSAMLAuth.get_idp(idp_name)

    # Custom parameter to define the Renater Federation Metadata
    SOCIAL_AUTH_SAML_FER_FEDERATION_SAML_METADATA_URL = values.Value(
        "https://metadata.federation.renater.fr/renater/main/main-idps-renater-metadata.xml"
    )

    SOCIAL_AUTH_SAML_FER_PIPELINE = MARSHA_DEFAULT_AUTH_PIPELINE

    # pylint: disable=invalid-name
    @property
    def AWS_SOURCE_BUCKET_NAME(self):
        """Source bucket name.

        If this setting is set in an environment variable we use it. Otherwise
        the value is computed with the AWS_BASE_NAME value.
        """
        return os.environ.get(
            "DJANGO_AWS_SOURCE_BUCKET_NAME", f"{self.AWS_BASE_NAME}-marsha-source"
        )

    # pylint: disable=invalid-name
    @property
    def AWS_DESTINATION_BUCKET_NAME(self):
        """Destination bucket name.

        If this setting is set in an environment variable we use it. Otherwise
        the value is computed with the AWS_BASE_NAME value.
        """
        return os.environ.get(
            "DJANGO_AWS_DESTINATION_BUCKET_NAME",
            f"{self.AWS_BASE_NAME}-marsha-destination",
        )

    # pylint: disable=invalid-name
    @property
    def SIMPLE_JWT(self):
        """Define settings for `djangorestframework_simplejwt`.

        The JWT_SIGNING_KEY must be evaluated late as the jwt library check for string type.
        """
        return {
            "ACCESS_TOKEN_LIFETIME": timedelta(
                seconds=values.IntegerValue(
                    default=300,
                    environ_name="ACCESS_TOKEN_LIFETIME",
                ),
            ),
            "REFRESH_TOKEN_LIFETIME": timedelta(
                seconds=values.IntegerValue(
                    default=86400,
                    environ_name="REFRESH_TOKEN_LIFETIME",
                ),
            ),
            "ALGORITHM": "HS256",
            "SIGNING_KEY": str(self.JWT_SIGNING_KEY),
            "AUTH_TOKEN_CLASSES": (
                "rest_framework_simplejwt.tokens.AccessToken",
                "marsha.core.simple_jwt.tokens.ChallengeToken",
                # For now ResourceAccessToken & UserAccessToken are also AccessToken
                # but this will allow migration when types will differ.
                # Note: AccessToken must remain enabled during the migration and removed
                # only after (version N changes token types, N+1 removes AccessToken).
                "marsha.core.simple_jwt.tokens.ResourceAccessToken",
                "marsha.core.simple_jwt.tokens.UserAccessToken",
            ),
            # Settings for authentication API
            "UPDATE_LAST_LOGIN": True,
            "TOKEN_OBTAIN_SERIALIZER": "marsha.account.serializers.UserTokenObtainPairSerializer",
            "ROTATE_REFRESH_TOKENS": True,
            "BLACKLIST_AFTER_ROTATION": True,
            "TOKEN_REFRESH_SERIALIZER": "marsha.account.serializers.TokenRefreshSerializer",
        }

    # pylint: disable=invalid-name
    @property
    def RELEASE(self):
        """
        Return the release information.

        Delegate to the module function to enable easier testing.
        """
        return get_release()

    @classmethod
    def _get_environment(cls):
        """Environment in which the application is launched."""
        return cls.__name__.lower()

    # pylint: disable=invalid-name
    @property
    def ENVIRONMENT(self):
        """Environment in which the application is launched."""
        return self._get_environment()

    @classmethod
    def post_setup(cls):
        """Post setup configuration.

        This is the place where you can configure settings that require other
        settings to be loaded.
        """
        super().post_setup()

        # The DJANGO_SENTRY_DSN environment variable should be set to activate
        # sentry for an environment
        if cls.SENTRY_DSN is not None:
            sentry_sdk.init(
                dsn=cls.SENTRY_DSN,
                environment=cls._get_environment(),
                release=get_release(),
                integrations=[DjangoIntegration()],
            )
            with sentry_sdk.configure_scope() as scope:
                scope.set_extra("application", "backend")


class Build(Base):
    """Settings used when the application is built.

    This environment should not be used to run the application. Just to build it with non blocking
    settings.
    """

    ALLOWED_HOSTS = []
    AWS_ACCESS_KEY_ID = values.Value("")
    AWS_SECRET_ACCESS_KEY = values.Value("")
    AWS_BASE_NAME = values.Value("")
    AWS_MEDIALIVE_ROLE_ARN = values.Value("")
    AWS_MEDIAPACKAGE_HARVEST_JOB_ARN = values.Value("")
    BBB_API_SECRET = values.Value("")
    SECRET_KEY = values.Value("DummyKey")
    STATICFILES_STORAGE = values.Value(
        "marsha.core.static.MarshaCompressedManifestStaticFilesStorage"
    )
    STATIC_POSTPROCESS_IGNORE_REGEX = values.Value(
        r"^js\/build\/[0-9]*\..*\.js(\.map)?$"
    )
    STATIC_POSTPROCESS_MAP_IGNORE_REGEX = values.Value(
        r"^js\/build\/[0-9]*\..*\.js\.map$"
    )


class Development(Base):
    """Development environment settings.

    We set ``DEBUG`` to ``True`` by default, configure the server to respond to all hosts.
    """

    ALLOWED_HOSTS = ["*"]
    CORS_ALLOWED_ORIGINS = values.ListValue(["http://localhost:3000"])
    AWS_BASE_NAME = values.Value("development")
    DEBUG = values.BooleanValue(True)
    CLOUDFRONT_SIGNED_URLS_ACTIVE = values.BooleanValue(False)
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}
    STAT_BACKEND = values.Value("marsha.core.stats.dummy_backend")

    # Development tools
    INSTALLED_APPS = Base.INSTALLED_APPS + ["marsha.development.apps.DevelopmentConfig"]

    # Mail
    EMAIL_HOST = values.Value("mailcatcher")
    EMAIL_PORT = values.PositiveIntegerValue(1025)

    # Logging
    LOGGING = values.DictValue(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "gelf": {
                    "()": "logging_gelf.formatters.GELFFormatter",
                    "null_character": True,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
                "gelf": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "formatter": "gelf",
                },
            },
            "loggers": {
                "marsha": {
                    "handlers": ["console"],
                    "level": "DEBUG",
                    "propagate": True,
                },
                # This formatter is here as an example to what is possible to do
                # with xapi loogers.
                "xapi": {"handlers": ["gelf"], "level": "INFO", "propagate": True},
            },
        }
    )

    @classmethod
    def setup(cls):
        # Add settings from the Renater FER SAML testing suite
        # pylint: disable=import-outside-toplevel
        from social_edu_federation.testing.settings import saml_fer_settings

        # pylint: enable=import-outside-toplevel

        for setting_name, setting_value in saml_fer_settings.items():
            setattr(cls, setting_name, values.Value(setting_value))

        cls.SOCIAL_AUTH_SAML_FER_IDP_FAKER = values.Value(True)
        cls.SOCIAL_AUTH_SAML_FER_FEDERATION_SAML_METADATA_URL = values.Value(
            # Metadata is fetched from inside the docker, hence the 8000 port
            "http://localhost:8000/account/saml/idp/metadata/"
        )
        cls.SOCIAL_AUTH_SAML_FER_IDP_FAKER_DOCKER_PORT = 8060

        # Call setup afterward
        super().setup()


class Test(Base):
    """Test environment settings."""

    CLOUDFRONT_SIGNED_URLS_ACTIVE = False
    AWS_BASE_NAME = values.Value("test")
    # Enable it to speed up tests by stopping WhiteNoise from scanning your static files
    WHITENOISE_AUTOREFRESH = True
    LIVE_CHAT_ENABLED = False
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }

    # Development tools (we want to test them in tests)
    INSTALLED_APPS = Base.INSTALLED_APPS + ["marsha.development.apps.DevelopmentConfig"]


class Production(Base):
    """Production environment settings.

    You must define the DJANGO_ALLOWED_HOSTS environment variable in Production
    configuration (and derived configurations):

    DJANGO_ALLOWED_HOSTS="foo.com,foo.fr"
    """

    ALLOWED_HOSTS = values.ListValue(None)

    STATICFILES_STORAGE = values.Value(
        "marsha.core.static.MarshaCompressedManifestStaticFilesStorage"
    )
    STATIC_POSTPROCESS_IGNORE_REGEX = values.Value(
        r"^js\/build\/[0-9]*\..*\.js(\.map)?$"
    )
    STATIC_POSTPROCESS_MAP_IGNORE_REGEX = values.Value(
        r"^js\/build\/[0-9]*\..*\.js\.map$"
    )

    AWS_BASE_NAME = values.Value("production")

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # pylint: disable=invalid-name
    @property
    def STATIC_URL(self):
        """Compute the absolute static url used in the lti template."""
        return f"//{self.CLOUDFRONT_DOMAIN}/static/"


class Staging(Production):
    """Staging environment settings."""

    AWS_BASE_NAME = values.Value("staging")


class PreProduction(Production):
    """Pre-production environment settings."""

    AWS_BASE_NAME = values.Value("preprod")
