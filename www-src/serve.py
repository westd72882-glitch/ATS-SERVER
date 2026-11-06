import http.server,socketserver,os,socket
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map={**http.server.SimpleHTTPRequestHandler.extensions_map,'.glb':'model/gltf-binary','.js':'application/javascript'}
    def end_headers(self):
        self.send_header('Cache-Control','no-cache');super().end_headers()
socketserver.TCPServer.allow_reuse_address=True
with socketserver.ThreadingTCPServer(('0.0.0.0',8000),H) as s:
    try:ip=socket.gethostbyname(socket.gethostname())
    except Exception:ip='localhost'
    print('http://localhost:8000   (в сети: http://%s:8000)'%ip)
    s.serve_forever()
