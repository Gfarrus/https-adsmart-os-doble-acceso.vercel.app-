export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const klaviyoKey = process.env.KLAVIYO_API_KEY;
  if (!klaviyoKey) {
    return res.status(500).json({ error: 'KLAVIYO_API_KEY not configured' });
  }

  const { action, listName, emails } = req.body;

  try {
    if (action === 'create_list') {
      // Create a new list in Klaviyo
      const response = await fetch('https://a.klaviyo.com/api/lists/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15'
        },
        body: JSON.stringify({
          data: {
            type: 'list',
            attributes: {
              name: listName
            }
          }
        })
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json({
        success: true,
        listId: data.data?.id,
        listName: data.data?.attributes?.name
      });
    }

    if (action === 'get_lists') {
      const response = await fetch('https://a.klaviyo.com/api/lists/', {
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
          'revision': '2024-02-15'
        }
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
