from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def ai_summarize(product_description):
    try:
        prompt = f"""
            Write a one-sentence professional ecommerce product summary.
            Make it appealing, specific, and natural (not generic).

            Product description:
            {product_description}   
        """
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )

        return response.text.strip() if response.text else None
    except Exception as e:
        print(f"AI error: {e}")
        return None
    