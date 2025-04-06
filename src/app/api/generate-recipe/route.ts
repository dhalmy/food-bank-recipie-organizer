import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, ingredients } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Create a detailed recipe using these ingredients: ${ingredients.join(', ')}. 
        Make a healthy and coherent recipe.
        USE BETWEEN 4 AND 6 INGREDIENTS NOT MORE THAN 6. IF MORE THAN 6 INGREDIENTS ARE PROVIDED, SELECT ONLY 6. 
        IF LESS THAN 4 INGREDIENTS ARE PROVIDED, SELECT THE REST FROM THE INGREDIENTS LIST.
        Additional instructions: ${prompt}.
        Respond in JSON format with this structure:
        {
          "name": "Recipe name",
          "cuisine": "Cuisine type",
          "ingredients": [
            {"name": "ingredient1", "quantity": "1", "unit": "cup"},
            {"name": "ingredient2", "quantity": "2", "unit": "pieces"}
          ],
          "prepTime": "10 minutes",
          "cookTime": "20 minutes",
          "instructions": ["Step 1", "Step 2"],
          "servings": 4,
          "equipment": ["Pan", "Oven"],
          "difficulty": "Easy",
          "author": "AI Chef"
        }`
      }],
      response_format: { type: "json_object" }
    });

    const recipe = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json({
      ...recipe,
      id: `ai-${Date.now()}`
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}