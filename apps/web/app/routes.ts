import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('routes/chat/layout.tsx', [
    //
    index('routes/chat/index.tsx'),
    route('/:id', 'routes/chat/id.tsx'),
  ]),

  route('/.well-known/appspecific/com.chrome.devtools.json', 'routes/debug-null.tsx'),
] satisfies RouteConfig
