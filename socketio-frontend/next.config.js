/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/socketio/:path*',
        destination: 'http://socketio-backend:8000/socket.io/:path*',
      },
    ]
  },
}

module.exports = nextConfig
