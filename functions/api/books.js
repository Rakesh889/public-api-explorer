export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  const page = Math.max(
    1,
    Math.min(100, parseInt(url.searchParams.get("page") || "1", 10))
  );

  const search = url.searchParams.get("search") || "";

  const apiUrl = new URL("https://gutendex.com/books/");
  apiUrl.searchParams.set("page", page);

  if (search.trim()) {
    apiUrl.searchParams.set("search", search.trim());
  }

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Accept": "application/json"
      },
      cf: {
        cacheTtl: 1800,
        cacheEverything: true
      }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Gutendex request failed",
          status: response.status
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1800, s-maxage=1800"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unable to connect to the books service"
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
