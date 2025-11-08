import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router'
import Home from './routes/Home'

const Root = createRootRoute({
	component: () => (
		<div className="min-h-dvh bg-neutral-950 text-neutral-100">
			<Outlet />
		</div>
	),
})

const IndexRoute = createRoute({
	getParentRoute: () => Root,
	path: '/',
	component: Home,
})

export const router = createRouter({
	routeTree: Root.addChildren([IndexRoute]),
	defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

export function AppRouterProvider() {
	return <RouterProvider router={router} />
}


