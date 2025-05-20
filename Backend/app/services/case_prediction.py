import re
import json
import nltk
import joblib
import numpy as np
import scipy.sparse
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.preprocessing import OneHotEncoder
from dotenv import load_dotenv
import os
import asyncio

from agents.extractor import process_raw_text
from services.load_pdf import load_pdf_pages

def ensure_nltk_resources():
    resources = ['punkt', 'stopwords', 'wordnet']
    
    for resource in resources:
        try:
            nltk.data.find(f'tokenizers/{resource}' if resource == 'punkt' 
                           else f'corpora/{resource}')
            print(f"NLTK resource '{resource}' already downloaded.")
        except LookupError:
            print(f"Downloading NLTK resource '{resource}'...")
            nltk.download(resource, quiet=True)


def preprocess_text(text, stopwords=None):
    text = re.sub(r'[^\w\s]', '', str(text).lower().strip())
    words = text.split()
    if stopwords:
        words = [w for w in words if w not in stopwords]
    lem = nltk.stem.wordnet.WordNetLemmatizer()
    return " ".join([lem.lemmatize(w) for w in words])


def setup_one_hot_encoders():
    decision_types = [
        "majority opinion", "per curiam", "plurality opinion",
        "equally divided", "opinion of the court", "dismissal - other",
        "dismissal - improvidently granted", "dismissal - moot"
    ]
    dispositions = [
        "reversed/remanded", "affirmed", "reversed", "vacated/remanded",
        "reversed in-part/remanded", "none", "reversed in-part",
        "vacated", "vacated in-part/remanded"
    ]
    dt_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    dt_encoder.fit(np.array(decision_types).reshape(-1, 1))
    disp_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    disp_encoder.fit(np.array(dispositions).reshape(-1, 1))
    return dt_encoder, disp_encoder


def predict_from_raw_text(raw_text: str):
    try:
        ensure_nltk_resources()

        vectorizer = joblib.load("app/assets/ml_models/vectorizer.pkl")
        lda_model = joblib.load("app/assets/ml_models/lda_model.pkl")
        model = joblib.load("app/assets/ml_models/case_prediction_model.pkl")
        dt_encoder, disp_encoder = setup_one_hot_encoders()

        features = asyncio.run(process_raw_text(raw_text))

        if "facts" not in features:
            return {"error": "Extraction failed", "details": features}

        stopwords = nltk.corpus.stopwords.words("english")
        cleaned_facts = preprocess_text(features["facts"], stopwords)

        X_text = vectorizer.transform([cleaned_facts])
        dt_one_hot = dt_encoder.transform(
            [[features["decision_type"].lower()]])
        disp_one_hot = disp_encoder.transform(
            [[features["disposition"].lower()]])

        X_combined_raw = scipy.sparse.hstack([
            X_text,
            scipy.sparse.csr_matrix(dt_one_hot),
            scipy.sparse.csr_matrix(disp_one_hot)
        ])

        X_lda = lda_model.transform(X_combined_raw)
        prediction = model.predict(X_lda)[0]
        prediction_proba = model.predict_proba(X_lda)[0]

        return {
            "prediction": int(prediction),
            "probability": prediction_proba.tolist(),
            "features": {
                "first_party": features["first_party"],
                "second_party": features["second_party"],
                "decision_type": features["decision_type"],
                "disposition": features["disposition"]
            }
        }

    except Exception as e:
        return {"error": str(e)}


# ----------------------
# 🧪 TESTING MAIN BLOCK
# ----------------------
if __name__ == "__main__":
    async def test_prediction():
        load_dotenv()
        pdf_path = "app/assets/legalcase_demo.pdf"
        pages = await load_pdf_pages(pdf_path)
        full_text = "\n".join([p.page_content for p in pages])
        result = predict_from_raw_text(full_text)
        print(json.dumps(result, indent=2))

    asyncio.run(test_prediction())
