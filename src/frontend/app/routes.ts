import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('blogs', 'routes/blogs.tsx'),
  route('blogs/:id', 'routes/blogs.$id.tsx'),
  route('api/leaderboard', 'routes/api.leaderboard.ts'),
] satisfies RouteConfig
