from rest_framework import permissions, viewsets
from tournament.serializers import TournamentSerializer, ParticipantsSerializer
from tournament.models import Tournaments, Participants

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