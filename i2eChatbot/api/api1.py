import os
import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema.runnable import RunnablePassthrough
from dotenv import load_dotenv
import uvicorn
# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

# Create FastAPI app
app = FastAPI(
    title="i2e Consulting Chatbot API",
    description="API for RAG-powered i2e Consulting chatbot",
    version="1.0.0"
)

# Add this right after app = FastAPI(...)
# Ensure this is in your FastAPI app, right after app = FastAPI(...)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Pydantic models for request and response
class ChatRequest(BaseModel):
    query: str

class Source(BaseModel):
    url: str

class ChatResponse(BaseModel):
    query: str
    response: str
    sources: Optional[List[str]] = None

# Initialize RAG system
def initialize_rag_system():
    # Load URL mapping
    try:
        with open('C:/Users/navneet.anand/Downloads/ChatBot/i2eChatbot/url_mapping.json', 'r') as f:
            url_mapping = json.load(f)
    except FileNotFoundError:
        url_mapping = {}
        print("URL mapping file not found. Sources won't be displayed.")
        
    # Initialize embeddings and load existing vector store
    embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    db = FAISS.load_local("C:/Users/navneet.anand/Downloads/ChatBot/i2eChatbot/db_faiss_p1", embeddings, allow_dangerous_deserialization=True)
    
    # Initialize LLM
    llm = ChatGroq(
        temperature=0,
        groq_api_key=groq_api_key,
        model_name="llama3-8b-8192",
        streaming=True,  # Enable streaming
    )
    
    # Setup retriever
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})
    
    # Function to get source URLs from documents
    def get_source_urls(docs):
        urls = set()
        for doc in docs:
            filename = os.path.basename(doc.metadata.get('source', ''))
            if filename in url_mapping:
                urls.add(url_mapping[filename])
        return list(urls)

    # Setup prompt template
    prompt_template = """You are a virtual assistant for I2E Consulting, designed to provide accurate and helpful information to users.
    Your role is to answer questions about the company, including its services, products, clients, achievements, and other relevant details.

    **Guidelines**:
    1. Answer the question in a detailed manner, making sure to provide all relevant details.
    2. If asked about a specific person, search extensively for the person's name and provide all the relevant information about that person and their role.
    3. Generate answers in a point-wise format, providing clear and concise details.
    4. If the user asks for a specific topic in detail or in brief, search extensively through the entire set of documents and provide the answer in the requested detail or brevity.
    5. Use the provided data to generate your answers.
    6. For services:
        - Provide clear and concise details about specific offerings.
    7. For products:
        - Explain their features, benefits, and use cases.
    8. If asked about clients or partnerships, share general insights or feedback from clients.
    9. If the context does not contain the answer, respond with: "I'm sorry, but I couldn't find information about that in the provided context."
    10. Avoid providing incorrect or speculative answers.
    11. Answer the question based on the context provided. DO NOT use markdown formatting such as **, __, or * in your response. For emphasis, use plain text only.

    Context: {context}

    Question: {question}

    Answer: """
 
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=prompt_template,
    )
    
    # Create LLM chain
    llm_chain = LLMChain(llm=llm, prompt=prompt)
    
    return {
        'llm_chain': llm_chain,
        'retriever': retriever,
        'get_source_urls': get_source_urls
    }

# Initialize RAG system once at startup
rag_components = initialize_rag_system()

# Streaming chat endpoint
@app.post("/api/chat/")
async def chat_stream(request: ChatRequest):
    try:
        # Get relevant documents
        docs = rag_components['retriever'].get_relevant_documents(request.query)
        
        # Get source URLs
        sources = rag_components['get_source_urls'](docs)
        
        # Get context
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Create streaming generator function
        async def generate_streaming_response():
            # First yield the start of the JSON response
            yield '{"query": ' + json.dumps(request.query) + ', "response": "'
            
            # Stream the response text
            async for chunk in rag_components['llm_chain'].llm.astream(
                rag_components['llm_chain'].prompt.format(
                    context=context, 
                    question=request.query
                )
            ):
                # Get the content from the chunk and escape JSON special characters
                if hasattr(chunk, 'content'):
                    content = chunk.content
                else:
                    content = chunk.text if hasattr(chunk, 'text') else str(chunk)
                
                # Escape JSON special characters
                content = content.replace('"', '\\"').replace('\n', '\\n')
                yield content
            
            # Close the response string and add sources at the end
            yield '", "sources": ' + json.dumps(sources) + '}'
            
        # Return streaming response
        return StreamingResponse(
            generate_streaming_response(),
            media_type="application/json"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)