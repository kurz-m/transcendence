from rest_framework import viewsets
from tournament.serializers import TournamentSerializer, ParticipantsSerializer
from tournament.models import Tournaments, Participants
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import permissions

# Create your views here.
class TournamentViewSet(viewsets.ModelViewSet):
    """
    API enpoint that allows users to view tournaments.
    """
    queryset = Tournaments.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ParticipantViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view Participants.
    """
    queryset = Participants.objects.all()
    serializer_class = ParticipantsSerializer
    
    @action(detail=True, methods=['get'])
    def retrieve_tournament(self, request, pk=None):
        tournament = self.get_object()
        serializer = self.get_serializer(tournament)
        return Response(serializer.data)