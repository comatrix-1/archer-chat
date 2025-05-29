import { Link } from "react-router";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-gray-800 mb-6">
					Page Not Found
				</h2>
				<p className="text-gray-600 mb-8">
					Oops! The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					to="/"
					className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Go back home
				</Link>
			</div>
		</div>
	);
}
