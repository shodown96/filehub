from rest_framework.exceptions import APIException
from common.constants import ErrorMessages


class BadRequestError(APIException):
    """
    BadRequestError represents an error generarted when the client provides
    an invalid input.
    """

    status_code = 400
    detail = ErrorMessages.BadRequest

    def __init__(self, detail=None):
        if detail:
            self.detail = detail

    def __str__(self):
        return str(self.detail)
