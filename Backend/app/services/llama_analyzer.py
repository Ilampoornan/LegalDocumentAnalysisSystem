from groq import Groq
import os
import json
import time
from dotenv import load_dotenv
from services.llm_factory import llm
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_legal_text_with_llama(text, model="llama3-70b-8192"):
    if len(text.split()) > 1500:
        text = " ".join(text.split()[:1500])

    prompt = f"""
    You are a legal document analysis expert. Your task is to extract key legal information from the text below.

    Analyze the document and provide the following in **strict JSON format**:

    1. "summary": A concise 4-5 sentence summary of the document's purpose and context.
    2. "key_clauses": A list of the main legal clauses (e.g., confidentiality, liability, termination) and their meanings.
    3. "potential_issues": A list of ambiguous terms, missing standard clauses, or any risks/uncertainties in the document.
    4. "parties_and_obligations": A list detailing each party mentioned and their specific roles, rights, or obligations.

    **Important Instructions**:
    - Use only information explicitly stated or implied in the text.
    - Do not fabricate or assume details.
    - If any field cannot be found, return an empty list or a clear note like "No clauses found."
    - Format your response as a valid JSON object only — no explanation, no prose.

    Here is the legal text to analyze:
    {text}

    Respond in this format:
    {{
      "summary": "...",
      "key_clauses": ["..."],
      "potential_issues": ["..."],
      "parties_and_obligations": ["..."]
    }}
    """

    try:
        start = time.time()
        chat_completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a legal document analysis expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6
        )
        end = time.time()
        content = chat_completion.choices[0].message.content

        try:
            parsed = json.loads(content)
            parsed["processing_time"] = f"{end - start:.2f}s"
            
            return {
                "summary": parsed.get("summary", "No summary provided."),
                "key_clauses": parsed.get("key_clauses", []),
                "potential_issues": parsed.get("potential_issues", []),
                "parties_and_obligations": parsed.get("parties_and_obligations", []),
                "processing_time": parsed.get("processing_time", "N/A"),
                "raw_output": content  # Keep raw output for debugging
            }
        except json.JSONDecodeError:
            return {
                "summary": content,
                "key_clauses": [],
                "potential_issues": [],
                "parties_and_obligations": [],
                "raw_output": content,
                "processing_time": f"{end - start:.2f}s"
            }
    except Exception as e:
        return {"error": f"Groq API call failed: {e}"}
