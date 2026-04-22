import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('blogs', 'routes/blogs.tsx'),
  route('blogs/:id', 'routes/blogs.$id.tsx'),
  route('auth/callback', 'routes/auth.callback.tsx'),
  // Under `/resources/*` so ingress can reserve `/api` and `/swagger` for the .NET Web API.
  route('resources/leaderboard', 'routes/resources.leaderboard.ts'),
] satisfies RouteConfig
