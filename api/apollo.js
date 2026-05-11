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
    // Build query string with array params
    const params = new URLSearchParams();
    (titles || []).forEach(t => params.append('person_titles[]', t));
    (locations || ['Neuquén, Argentina']).forEach(l => params.append('person_locations[]', l));
    params.append('per_page', limit);

    const url = `https://api.apollo.io/api/v1/mixed_people/api_search?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'x-api-key': apolloKey,
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(200).json({ success: false, error: data.error || data.errorDescription || JSON.stringify(data) });
    }

    const contacts = (data.people || []).map(p => ({
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      title: p.title,
      company: p.organization?.name,
      email: p.email,
      id: p.id
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
