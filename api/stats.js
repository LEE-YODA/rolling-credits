export default async function handler(req, res) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.DATABASE_ID;

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const pages = data.results;

    let movieCount = 0;
    let dramaCount = 0;

    let movieSum = 0;
    let dramaSum = 0;

    let bestMovie = { title: "", rating: 0 };
    let bestDrama = { title: "", rating: 0 };

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM

    pages.forEach((p) => {
      const status = p.properties["상태"]?.select?.name;
      const type = p.properties["타입"]?.select?.name;
      const rating = p.properties["평점"]?.number || 0;
      const date = p.properties["날짜"]?.date?.start;
      const title = p.properties["이름"]?.title?.[0]?.plain_text || "";

      if (!date || status !== "완료") return;

      if (!date.startsWith(thisMonth)) return;

      if (type === "영화") {
        movieCount++;
        movieSum += rating;

        if (rating > bestMovie.rating) {
          bestMovie = { title, rating };
        }
      }

      if (type === "드라마") {
        dramaCount++;
        dramaSum += rating;

        if (rating > bestDrama.rating) {
          bestDrama = { title, rating };
        }
      }
    });

    res.status(200).json({
      movieCount,
      dramaCount,
      movieAvg: movieCount ? (movieSum / movieCount).toFixed(1) : 0,
      dramaAvg: dramaCount ? (dramaSum / dramaCount).toFixed(1) : 0,
      bestMovie,
      bestDrama,
      month: now.toLocaleString("en-US", { month: "long" }).toUpperCase(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
