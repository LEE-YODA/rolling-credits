export default async function handler(req, res) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.DATABASE_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    const pages = data.results;

    let watched = 0;
    let watching = 0;

    pages.forEach(p => {
      const status = p.properties["상태"]?.select?.name;

      if (status === "완료") watched++;
      if (status === "시청중") watching++;
    });

    res.status(200).json({ watched, watching });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
