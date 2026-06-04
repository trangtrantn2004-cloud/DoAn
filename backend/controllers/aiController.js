const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const parseOrder = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng cung cấp nội dung.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Server chưa cấu hình GEMINI_API_KEY.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Fetch danh sách sản phẩm
    const [products] = await db.execute('SELECT id, name, price, image_url, description FROM products');

    // 2. Tạo Prompt đa năng
    const prompt = `
Bạn là một trợ lý thông minh tên là Nero AI, làm việc tại quán Nero Coffee. 
Nhiệm vụ của bạn là hỗ trợ khách hàng: vừa tư vấn đồ uống, vừa trích xuất món ăn vào giỏ hàng.

Dưới đây là Menu của quán:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price })), null, 2)}

YÊU CẦU TRẢ VỀ: Một đối tượng JSON duy nhất (không có markdown \`\`\`json) với cấu trúc sau:
{
  "reply": "Lời phản hồi tự nhiên của bạn bằng tiếng Việt cho khách (ví dụ: tư vấn món, chào hỏi, hoặc xác nhận đã thêm món)",
  "items": [
    {
      "product_id": id_của_món,
      "name": "tên_món_chuẩn",
      "quantity": số_lượng,
      "note": "ghi_chú"
    }
  ],
  "recommendations": [id_của_các_món_bạn_gợi_ý_nếu_khách_đang_tìm_kiếm_hoặc_hỏi_ý_kiến. TỐI ĐA 3 MÓN]
}

QUY TẮC:
1. Nếu khách gọi món (ví dụ: "cho mình 2 bạc xỉu"): Hãy đưa món vào "items" và viết "reply" xác nhận vui vẻ.
2. Nếu khách hỏi tư vấn (ví dụ: "mình mệt quá nên uống gì", "có nước hoa quả không"): Hãy trả lời nhiệt tình trong "reply" và đưa IDs các món phù hợp vào mảng "recommendations" (CHỈ LẤY TOP 3 MÓN PHÙ HỢP NHẤT).
3. TỰ ĐỘNG MAP: Luôn map các tên món gọi dân dã sang ID món chuẩn nhất trong Menu.
4. Nếu khách chỉ chào hỏi: Chỉ trả về "reply" và mảng rỗng cho "items", "recommendations".

Khách nói: "${text}"
`;

    // 3. Gọi Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);

    let aiResponse = result.response.text().trim();
    aiResponse = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(aiResponse);

      // Bổ sung thông tin cho items
      const enrichedItems = (data.items || []).map(item => {
        const pInfo = products.find(p => p.id === item.product_id);
        return {
          ...item,
          price: pInfo ? Number(pInfo.price) : 0,
          image_url: pInfo ? pInfo.image_url : ''
        };
      }).filter(i => i.product_id);

      // Bổ sung thông tin cho recommendations (Giới hạn tối đa 3 món & Ép kiểu Price)
      const enrichedRecs = (data.recommendations || [])
        .slice(0, 3)
        .map(id => {
          const p = products.find(p => p.id === id);
          if (p) {
            return {
              ...p,
              price: Number(p.price) // Đảm bảo giá là số
            };
          }
          return null;
        }).filter(p => p);

      res.status(200).json({
        reply: data.reply,
        items: enrichedItems,
        recommendations: enrichedRecs
      });
    } catch (err) {
      console.error('Lỗi parse JSON:', aiResponse);
      res.status(500).json({ message: 'Lỗi parse AI response' });
    }

  } catch (error) {
    console.error('Lỗi AI:', error);
    res.status(500).json({ message: 'Lỗi hệ thống AI.' });
  }
};

module.exports = { parseOrder };
