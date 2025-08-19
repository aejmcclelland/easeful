export async function GET() {
	const r = await fetch('http://localhost:3000/api/taskman', {
		cache: 'no-store',
	});
	const json = await r.json();
	return Response.json(json, { status: r.status });
}
