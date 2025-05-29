import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorBoundary() {
	const error = useRouteError();
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1 className="text-2xl font-bold mb-4">{message}</h1>
			<p className="mb-4">{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto bg-gray-100 rounded">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
