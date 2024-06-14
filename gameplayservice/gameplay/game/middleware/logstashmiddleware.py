import json
import logging
import socket
import traceback
from logstash import TCPLogstashHandler

class LogstashMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger(__name__)
        self.logstash_handler = TCPLogstashHandler(host='logstash', port=5959, version=1)

        self.logger.setLevel(logging.DEBUG)
        self.logstash_handler.setLevel(logging.DEBUG)
        if not self.logger.hasHandlers():
            self.logger.addHandler(self.logstash_handler)

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def log_debug(self, request, message):
        log_data = {
            'level': 'debug',
            'message': message,
            'path': request.path,
            'method': request.method
        }
        self._send_log(log_data)

    def log_error(self, request, exception):
        log_data = {
            'level': 'error',
            'message': str(exception),
            'path': request.path,
            'method': request.method,
            'stack_trace': traceback.format_exc()
        }
        self._send_log(log_data)

    def log_info(self, request, message):
        log_data = {
            'level': 'info',
            'message': message,
            'path': request.path,
            'method': request.method
        }
        self._send_log(log_data)

    def _send_log(self, log_data):
        log_message = json.dumps(log_data)
        level = log_data.get('level', 'error')
        
        if level == 'debug':
            self.logger.debug(log_message)
        elif level == 'info':
            self.logger.info(log_message)
        elif level == 'warning':
            self.logger.warning(log_message)
        elif level == 'critical':
            self.logger.critical(log_message)
        else:
            self.logger.error(log_message)
