from __future__ import absolute_import

from rest_framework import serializers, status
from rest_framework.response import Response

from sentry.api.base import Endpoint
from sentry.api.decorators import sudo_required
from sentry.api.permissions import assert_perm
from sentry.api.serializers import serialize
from sentry.constants import MEMBER_ADMIN, STATUS_HIDDEN
from sentry.models import (
    AuditLogEntry, AuditLogEntryEvent, Project
)
from sentry.tasks.deletion import delete_project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('name', 'slug')


class ProjectDetailsEndpoint(Endpoint):
    def get(self, request, project_id):
        project = Project.objects.get_from_cache(id=project_id)

        assert_perm(project, request.user, request.auth)

        data = serialize(project, request.user)
        data['options'] = {
            'sentry:origins': '\n'.join(project.get_option('sentry:origins', None) or []),
            'sentry:resolve_age': int(project.get_option('sentry:resolve_age', 0)),
        }

        return Response(data)

    @sudo_required
    def put(self, request, project_id):
        project = Project.objects.get(id=project_id)

        assert_perm(project, request.user, request.auth, access=MEMBER_ADMIN)

        serializer = ProjectSerializer(project, data=request.DATA, partial=True)

        if serializer.is_valid():
            project = serializer.save()

            options = request.DATA.get('options', {})
            if 'sentry:origins' in options:
                project.update_option('sentry:origins', options['sentry:origins'].split('\n'))
            if 'sentry:resolve_age' in options:
                project.update_option('sentry:resolve_age', int(options['sentry:resolve_age']))

            AuditLogEntry.objects.create(
                organization=project.organization,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=project.id,
                event=AuditLogEntryEvent.PROJECT_EDIT,
                data=project.get_audit_log_data(),
            )

            data = serialize(project, request.user)
            data['options'] = {
                'sentry:origins': '\n'.join(project.get_option('sentry:origins', None) or []),
                'sentry:resolve_age': int(project.get_option('sentry:resolve_age', 0)),
            }
            return Response(data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @sudo_required
    def delete(self, request, project_id):
        project = Project.objects.get(id=project_id)

        if project.is_internal_project():
            return Response('{"error": "Cannot remove projects internally used by Sentry."}',
                            status=status.HTTP_403_FORBIDDEN)

        if not (request.user.is_superuser or project.team.owner_id == request.user.id):
            return Response('{"error": "form"}', status=status.HTTP_403_FORBIDDEN)

        if project.status != STATUS_HIDDEN:
            project.update(status=STATUS_HIDDEN)
            delete_project.delay(object_id=project.id)

            AuditLogEntry.objects.create(
                organization=project.organization,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=project.id,
                event=AuditLogEntryEvent.PROJECT_REMOVE,
                data=project.get_audit_log_data(),
            )

        return Response(status=204)
