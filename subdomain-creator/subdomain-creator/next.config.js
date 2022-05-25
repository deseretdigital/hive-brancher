/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    TEST_SERVER_HOST: process.env.TEST_SERVER_HOST,
    BASE_POST_BUILD_COMMANDS: process.env.BASE_POST_BUILD_COMMANDS
  },
}

module.exports = nextConfig
