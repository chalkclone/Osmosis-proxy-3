import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch('https://api.hubble.figment.io/v1/stargaze/transactions', {
      headers: {
        Authorization: `Bearer ${process.env.FIGMENT_API_KEY}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Ошибка от внешнего API:", text);
      return res.status(500).json({ error: "Ошибка получения данных с внешнего API", detail: text });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Ошибка сервера:", error.message || error);
    res.status(500).json({ error: "Ошибка сервера", detail: error.message || error });
  }
};

export default handler;
