export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apolloKey = process.env.APOLLO_API_KEY;
  if (!apolloKey) {
    return res.status(500).json({ error: 'APOLLO_API_KEY not configured' });
  }

  const { titles, locations, limit = 25 } = req.body;

  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apolloKey,
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        per_page: limit,
        page: 1,
        person_titles: titles || [],
        person_locations: locations || ['Argentina'],
        contact_email_status: ['verified', 'likely to engage']
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: JSON.stringify(data) });

    const contacts = (data.people || []).map(p => ({
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      title: p.title,
      company: p.organization?.name,
      email: p.email,
      linkedin: p.linkedin_url
    }));

    return res.status(200).json({
      success: true,
      total: data.pagination?.total_entries || contacts.length,
      contacts
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
