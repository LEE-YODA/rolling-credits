export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.notion.com/v1/databases/" + process.env.NOTION_DATABASE_ID + "/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    });

   const data = await response.json();

// 👇 여기 추가
    console.log("DB:", process.env.NOTION_DATABASE_ID);
console.log("NOTION 응답:", data);

// 👇 방어 코드
if (!data.results) {
  console.error("Notion API 오류:", data);
  return res.status(500).json({
    error: "NOTION_ERROR",
    detail: data
  });
}

const pages = data.results;

    let movieCount = 0;
    let dramaCount = 0;
    let movieTotal = 0;
    let dramaTotal = 0;

    let bestMovie = { title: "", rating: 0 };
    let bestDrama = { title: "", rating: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();

    pages.forEach(p => {
      const status = p.properties["상태"]?.select?.name;
      const type = p.properties["영화/드라마"]?.select?.name;
      const rating = p.properties["평점"]?.number || 0;
      const title = p.properties["이름"]?.title?.[0]?.plain_text || "";

      const watchDate = p.properties["시청일"]?.date?.start;
      if (!watchDate) return;

      const date = new Date(watchDate);
      if (date.getMonth() !== currentMonth) return;

      // 시청완료만 카운트
      if (status !== "WATCHED") return;

      if (type === "MOVIE") {
        movieCount++;
        movieTotal += rating;

        if (rating > bestMovie.rating) {
          bestMovie = { title, rating };
        }
      }

      if (type === "DRAMA") {
        dramaCount++;
        dramaTotal += rating;

        if (rating > bestDrama.rating) {
          bestDrama = { title, rating };
        }
      }
    });

    const movieAvg = movieCount ? (movieTotal / movieCount).toFixed(1) : 0;
    const dramaAvg = dramaCount ? (dramaTotal / dramaCount).toFixed(1) : 0;

    const month = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();

    res.status(200).json({
      movieCount,
      dramaCount,
      movieAvg,
      dramaAvg,
      bestMovie,
      bestDrama,
      month
    });

  } catch (err) {
    res.status(500).json({ error: "FAILED", detail: err.message });
  }
}
