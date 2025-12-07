export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function notFound(id) {
  return jsonResponse({ error: 'Not Found', id }, 404);
}

export function badRequest(msg) {
  return jsonResponse({ error: 'Bad Request', message: msg }, 400);
}

export function created(body) {
  return jsonResponse(body, 201);
}
