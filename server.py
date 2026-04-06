
import http.server
import socketserver
import os

PORT = 8000

os.chdir('/Users/didi/Desktop/0403-b-subsidy-ops-platform/B')

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
