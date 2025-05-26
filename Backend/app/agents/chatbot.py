import os
from dotenv import load_dotenv
from langchain_postgres import PGVector
from langchain_core.runnables import Runnable
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain.chat_models import init_chat_model
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableMap
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate
from services.llm_factory import llm

# === Load environment variables ===
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
DATABASE_URL= os.getenv("DATABASE_URL")
# USER_ID = os.getenv("USER_ID", "default-user-id")

# === Initialize LLMs ===
mistral = init_chat_model("mistral-large-latest", model_provider="mistralai")


# === Vector store and retriever ===
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")


vectorstore = PGVector(
    collection_name="legal_docs",
    connection=DATABASE_URL,
    embeddings=embeddings,
)

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 4}
)

# === Conversation memory ===
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)
# === Classifier LLMChain (to decide if RAG is needed) ===
classification_prompt = ChatPromptTemplate.from_template("""
You are a legal assistant.

Your task is to decide whether a given question requires access to specific legal documents to answer correctly.

Respond with:
- "yes" → if the question is about a specific clause, agreement, or content likely found in legal documents.
- "no" → if the question is a general legal concept that can be answered without referencing documents.

Question: "{question}"
""")

classifier_chain: Runnable = (
    classification_prompt
    | llm
    | StrOutputParser()
)

# Prompt for RAG
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a legal assistant. Only answer using the documents below. If nothing is relevant, say so."),
    MessagesPlaceholder(variable_name="chat_history"),  #  placeholder for memory
    ("human", "Documents:\n{context}\n\nQuestion: {question}")
])


# Create doc QA chain
document_chain = create_stuff_documents_chain(llm=llm, prompt=rag_prompt)

#  RAG chain
# qa_chain = RunnableMap({
#     "context": retriever,
#     "question": lambda x: x["question"]
# }) | document_chain

general_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly legal assistant your name is legal query bot developed by group G of CSE 22. Help the user using your general knowledge."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

# Wrap as a runnable
general_chain = general_prompt | llm | StrOutputParser()

# === Chatbot Function ===
def ask_legal_bot(user_input: str) -> str:

    # Step 1: Handle greetings
    casual_keywords = ["hi", "hello", "bye", "thanks"]
    if user_input.lower().strip() in casual_keywords:
        return "Hello! How can I assist you with legal information today?"

    # Step 2: Classify
    decision = classifier_chain.invoke({"question": user_input}).strip().lower()
    print(f"[Classifier decision]: {decision}")

    print(" Chat History:")
    # for msg in memory.chat_memory.messages:
    #     role = "User" if msg.type in ("human", "user") else "Assistant"
    #     print(f"{role}: {msg.content}")
    print(memory.chat_memory.messages)

    # Step 3: Based on classification
    if decision == "yes":
        print("Running RAG")
        retrieved_docs = retriever.invoke(user_input)
        chat_history = memory.load_memory_variables({})["chat_history"]
        response = document_chain.invoke({
            "question": user_input,
            "context": retrieved_docs,
            "chat_history": chat_history
        })

        memory.save_context({"question": user_input}, {"output": response})

        # sources = response.get("source_documents", [])

        # if not sources and len(response.split()) < 10:
        #     return 'I couldn't find relevant legal documents to answer that. Please provide more context or upload documents."
        return response

    else:
        print("[Running LLM-only]")
        response = general_chain.invoke({
            "question": user_input,
            "chat_history": memory.load_memory_variables({})["chat_history"]
        })
        memory.save_context({"question": user_input}, {"output": response})
        return response
    
    

# === CLI test ===
# if __name__ == "__main__":

#     print(" Legal Assistant Ready. Type 'exit' to quit.\n")
#     while True:
#         user_input = input("You: ")
#         if user_input.lower() in {"exit", "quit"}:
#             break
#         print(" Bot:", ask_legal_bot(user_input))
