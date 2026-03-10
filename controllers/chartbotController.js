import Groq from "groq-sdk";
import Product from "../models/product.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function query_database(filter) {
  try {
    const query = {};
    const options = {};

    if (filter.where) Object.assign(query, filter.where);

    if (filter.limit && typeof filter.limit === "number") {
      options.limit = filter.limit;
    }

    if (filter.sort) options.sort = filter.sort;

    const products = await Product.find(query, null, options);

    if (!products.length) return JSON.stringify({ type: "text", content: "No products found." });

    const productList = products.map((p) => ({
      productID: p.productID,
      name: p.pName,
      altNames: p.pAltname || [],
      description: p.pDescription,
      price: p.price,
      labelPrice: p.lebalPrice,
      category: p.category,
      brand: p.Brand,
      model: p.Model,
      stock: p.stock,
      isAvailable: p.isAvailable,
      images: p.images || [],
    }));

    return JSON.stringify({ type: "products", content: productList });

  } catch (error) {
    return JSON.stringify({ type: "text", content: `Database error: ${error.message}` });
  }
}

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Please send a message" });
    }

    const messages = [
      {
        role: "system",
        content: `You are a friendly and helpful customer service assistant for a computer hardware and electronics shop.
        
        YOUR PERSONALITY:
        - Be warm, friendly and conversational like a real shop assistant
        - Be patient — customers may not know technical terms
        - If a customer types with spelling mistakes or unclear questions, understand what they MEAN and respond helpfully
        - Never say "I don't understand" — always try your best to help
        - Keep answers short and easy to read — avoid long paragraphs
        - Use simple language, not technical jargon unless customer uses it first

        YOU HAVE ACCESS TO A PRODUCTS DATABASE WITH THESE FIELDS:
        - productID: unique product ID
        - pName: product name
        - pAltname: alternative/common names customers might use
        - pDescription: product description
        - price: our selling price (in Rs.)
        - lebalPrice: original label price — if higher than price, there is a discount
        - category: product category (CPU, GPU, RAM, Power Supply, etc.)
        - Brand: product brand name
        - Model: product model
        - stock: quantity available in stock
        - isAvailable: true means in stock and ready to buy
        - images: product photos

        UNDERSTAND THESE CUSTOMER INTENTS AND RESPOND ACCORDINGLY:

        1. GREETING (hi, hello, hey, good morning, etc.)
           → Greet back warmly, introduce yourself briefly, ask how you can help

        2. ASKING ABOUT A SPECIFIC PRODUCT (what is X, tell me about X, do you have X)
           → Query database for that product, give name, price, discount if any, availability

        3. ASKING FOR PRICE (how much is X, price of X, cost of X, wat is the prize, prce)
           → Query and give the price clearly. If label price is higher, show the discount too
           → Example: "Rs. 39,500 (was Rs. 42,000 — you save Rs. 2,500!)"

        4. ASKING ABOUT STOCK / AVAILABILITY (is X available, do you have X, X in stock?)
           → Query and clearly say yes/no and how many are left

        5. ASKING TO SEE PRODUCTS BY CATEGORY (show me CPUs, what GPUs do you have, any RAM?)
           → Query by category and list products with prices

        6. ASKING FOR CHEAPEST / MOST EXPENSIVE (cheapest CPU, best price, budget option)
           → Query with sort by price, show options

        7. ASKING FOR RECOMMENDATIONS (what should I buy for gaming, good CPU under 70000)
           → Query relevant products, give a friendly recommendation with reasons

        8. ASKING ABOUT DISCOUNT / OFFER (any offers, discount, sale price)
           → Query products where price < lebalPrice and highlight savings

        9. ASKING TO SEE IMAGES (show image, photo, picture, show me how it looks)
           → Query the product — the system will automatically show images

        10. VAGUE OR UNCLEAR QUESTIONS (something for my pc, I need a part, help me)
            → Ask ONE simple follow-up question to understand what they need
            → Example: "Sure! Are you looking for a CPU, GPU, RAM, or something else?"

        11. SPELLING MISTAKES OR TYPOS (prcessor, motherbord, pwoer supply, grafic card)
            → Understand what they mean and respond correctly — never point out the spelling mistake

        12. CASUAL CHAT (how are you, thank you, bye, you are helpful)
            → Respond naturally and warmly like a real person

        13. QUESTIONS OUTSIDE YOUR SCOPE (weather, news, jokes)
            → Politely say you can only help with products in the shop

        IMPORTANT TECHNICAL RULES:
        - "limit" parameter MUST be a NUMBER like 5. NEVER use "all" or any string — just omit it for all products
        - Always query the database before answering product questions — never guess
        - When showing prices always use Rs. format
        - If stock is 0 or isAvailable is false — tell customer clearly it is out of stock`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "query_database",
          description:
            "Query the products database. Use when customer asks about any product, price, stock, brand, category, discount, recommendation, or image.",
          parameters: {
            type: "object",
            properties: {
              where: {
                type: "object",
                description:
                  "Filter conditions. Examples: { category: 'CPU' } or { Brand: 'Corsair' } or { isAvailable: true } or { pName: 'i5 12400' }",
              },
              sort: {
                type: "object",
                description:
                  "Sort order. Examples: { price: 1 } for cheapest first, { price: -1 } for most expensive first",
              },
              limit: {
                type: "number",
                description:
                  "Number of results to return. Must be a NUMBER like 5. Omit this field completely if you want all products.",
              },
            },
          },
        },
      },
    ];

    let response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 1024,
    });

    let aiMessage = response.choices[0].message;
    let foundProducts = [];

    while (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      messages.push(aiMessage);

      for (const toolCall of aiMessage.tool_calls) {
        const rawArgs = JSON.parse(toolCall.function.arguments);

        // Safety — remove limit if not a valid number
        const filter = { ...rawArgs };
        if (filter.limit !== undefined && typeof filter.limit !== "number") {
          delete filter.limit;
        }

        console.log("🤖 AI querying database with filter:", filter);

        const dbResultRaw = await query_database(filter);

        try {
          const parsed = JSON.parse(dbResultRaw);
          if (parsed.type === "products" && parsed.content.length > 0) {
            foundProducts = parsed.content;
          }
        } catch (_) {}

        const readableResult = (() => {
          try {
            const parsed = JSON.parse(dbResultRaw);
            if (parsed.type === "products") {
              return parsed.content
                .map(
                  (p) =>
                    `Name: ${p.name} | Price: Rs.${p.price} | Label Price: Rs.${p.labelPrice} | Category: ${p.category} | Brand: ${p.brand} | Stock: ${p.stock} | Available: ${p.isAvailable} | Has Images: ${p.images.length > 0 ? "Yes" : "No"}`
                )
                .join("\n");
            }
            return parsed.content;
          } catch (_) {
            return dbResultRaw;
          }
        })();

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: readableResult,
        });
      }

      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
      });

      aiMessage = response.choices[0].message;
    }

    const finalAnswer = aiMessage.content || "Sorry, I couldn't generate a response.";

    const askedForImage = /image|photo|picture|show me|look like|see it/i.test(message);

    const responseData = {
      answer: finalAnswer,
      question: message,
      timestamp: new Date(),
    };

    if (askedForImage && foundProducts.length > 0) {
      const productsWithImages = foundProducts.filter(
        (p) => p.images && p.images.length > 0
      );
      if (productsWithImages.length > 0) {
        responseData.images = productsWithImages.map((p) => ({
          productID: p.productID,
          name: p.name,
          price: p.price,
          image: p.images[0],
          allImages: p.images,
        }));
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error("❌ Chat error:", error?.message || error);
    res.status(500).json({ error: "Something went wrong", details: error?.message });
  }
};