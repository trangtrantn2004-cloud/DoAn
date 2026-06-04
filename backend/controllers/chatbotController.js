const pool = require('../config/db');

const getRecommendation = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();
    
    let recommendationQuery = 'SELECT * FROM products';
    let responseText = '';

    if (lowerMessage.includes('mệt') || lowerMessage.includes('tỉnh táo') || lowerMessage.includes('đắng')) {
      responseText = 'Bạn cần một sự kích thích mạnh mẽ? Tôi đề xuất Cà Phê Đen Đá hoặc Cà Phê Phin Sữa Đá để bắt đầu ngày mới tỉnh táo!';
      recommendationQuery += " WHERE name LIKE '%Đen%' OR name LIKE '%Phin%'";
    } else if (lowerMessage.includes('ngọt') || lowerMessage.includes('béo') || lowerMessage.includes('nhẹ')) {
      responseText = 'Nếu bạn thích vị ngọt ngào và béo ngậy, hãy thử Caramel Macchiato hoặc Cappuccino nhé!';
      recommendationQuery += " WHERE name LIKE '%Caramel%' OR name LIKE '%Cappuccino%'";
    } else if (lowerMessage.includes('nóng')) {
      responseText = 'Giữa tiết trời này, một ly Cappuccino Nóng chắc chắn sẽ làm bạn ấm lòng.';
      recommendationQuery += " WHERE name LIKE '%Nóng%'";
    } else if (lowerMessage.includes('chào') || lowerMessage.includes('hi')) {
      responseText = 'Xin chào! Tôi là trợ lý ảo của Nero Coffee. Tôi có thể giúp gì cho bạn hôm nay? Bạn muốn tìm đồ uống đắng, ngọt, hay nóng?';
    } else {
      responseText = 'Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn có thể thử hỏi về đồ uống "đắng", "ngọt", hoặc "tỉnh táo" để tôi tư vấn nhé!';
      recommendationQuery += ' WHERE is_featured = true';
    }

    const [products] = await pool.query(recommendationQuery);
    
    res.json({
      reply: responseText,
      products: products.slice(0, 2)
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getRecommendation };
