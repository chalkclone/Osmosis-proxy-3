import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Здесь подставьте свой API-запрос или логику
    const response = await fetch('https://api.stargaze.zone/txs') // Пример API

    if (!response.ok) {
      throw new Error(`Stargaze API returned status ${response.status}`)
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

