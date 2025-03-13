import streamlit as st
import requests
import json
import time

# Page configuration
st.set_page_config(
    page_title="i2e Consulting Chatbot", 
    page_icon="🤖", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E3A8A;
    }
    .chat-message-user {
        background-color: #DBEAFE;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border-left: 5px solid #3B82F6;
    }
    .chat-message-bot {
        background-color: #F3F4F6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border-left: 5px solid #6B7280;
    }
    .source-link {
        font-size: 0.8rem;
        color: #4B5563;
        margin-top: -0.5rem;
        margin-bottom: 1rem;
        padding-left: 1rem;
    }
    .stButton button {
        background-color: #1E3A8A;
        color: white;
        border-radius: 0.5rem;
    }
    .stButton button:hover {
        background-color: #2563EB;
    }
    .typing-indicator {
        display: inline-block;
        margin-left: 5px;
    }
    .typing-indicator span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #3B82F6;
        border-radius: 50%;
        margin-right: 3px;
        animation: typing 1s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes typing {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
</style>
""", unsafe_allow_html=True)

# Title and description
st.markdown('<h1 class="main-header">i2e Consulting Chatbot</h1>', unsafe_allow_html=True)
st.markdown("Ask any question about i2e Consulting's services, expertise, and capabilities.")

# Sidebar configuration
with st.sidebar:
    st.image("https://via.placeholder.com/150x80?text=i2e+Logo", width=150)
    st.markdown("## API Configuration")
    
    # API endpoint configuration
    api_url = st.text_input(
        "API Endpoint", 
        value="http://localhost:8000/api/chat/",
        help="Enter the URL of the i2e chatbot API"
    )
    
    # API Key (optional for secure endpoint)
    use_secure_endpoint = st.checkbox("Use secure endpoint", value=False)
    
    if use_secure_endpoint:
        api_key = st.text_input("API Key", type="password", help="Enter your API key for authentication")
    else:
        api_key = ""
    
    st.markdown("---")
    
    # About section
    st.markdown("### About")
    st.markdown("""
    This chatbot uses RAG (Retrieval Augmented Generation) to answer questions about i2e Consulting using information from the company website.
    
    **Features:**
    - Powered by Llama-3 8B
    - Uses BGE embeddings for document retrieval
    - Sources linked to original content
    - Real-time streaming responses
    """)

# Initialize session state for chat history and input management
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'should_clear_input' not in st.session_state:
    st.session_state.should_clear_input = False

# Function to handle form submission and set clear flag
def handle_input():
    if st.session_state.question_input:
        st.session_state.current_question = st.session_state.question_input
        st.session_state.should_clear_input = True
        return True
    return False

# Function to stream responses from API
def stream_response(query):
    payload = {"query": query}
    headers = {"Accept": "application/json"}

    if use_secure_endpoint and api_key:
        headers["api-key"] = api_key

    try:
        # Create placeholder for streaming response
        response_placeholder = st.empty()
        
        # Start with empty response
        accumulated_response = ""
        sources = []
        buffer = ""
        complete_json = False
        
        # Make streaming request
        with requests.post(api_url, json=payload, headers=headers, stream=True) as response:
            response.raise_for_status()
            
            # Read the response as it comes in
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    # Decode the chunk and add to buffer
                    chunk_text = chunk.decode('utf-8')
                    buffer += chunk_text
                    
                    # Try to parse JSON if we have complete response
                    if buffer.endswith('}'):
                        try:
                            json_data = json.loads(buffer)
                            accumulated_response = json_data.get("response", "")
                            sources = json_data.get("sources", [])
                            complete_json = True
                        except json.JSONDecodeError:
                            # Incomplete JSON, continue collecting chunks
                            pass
                    
                    # Handle streaming response (may be partial JSON)
                    if not complete_json:
                        # Try to extract the partial response between the first quote after "response": 
                        # and the last quote in the buffer
                        import re
                        response_match = re.search(r'"response":\s*"(.*)', buffer)
                        if response_match:
                            partial_text = response_match.group(1)
                            # Handle escape characters in the JSON string
                            partial_text = partial_text.replace('\\"', '"').replace('\\n', '\n')
                            # Remove trailing quote and everything after if present
                            last_quote_pos = partial_text.rfind('", "sources"')
                            if last_quote_pos > -1:
                                partial_text = partial_text[:last_quote_pos]
                            accumulated_response = partial_text
                    
                    # Update the UI with current response text
                    response_placeholder.markdown(f"""
                    <div class="chat-message-bot">
                        <strong>i2e Chatbot:</strong><br>
                        {accumulated_response}
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Short delay to make streaming visible
                    time.sleep(0.05)
            
            # Display sources after response is complete
            if sources:
                source_html = "<div class='source-link'><strong>Sources:</strong><br>"
                for source in sources:
                    source_html += f"<a href='{source}' target='_blank'>{source}</a><br>"
                source_html += "</div>"
                st.markdown(source_html, unsafe_allow_html=True)
            
            return accumulated_response, sources
            
    except requests.exceptions.RequestException as e:
        st.error(f"Error communicating with API: {e}")
        return None, None

# Main chat interface
st.markdown("### Chat")

# Set default value if we need to clear the input
default_value = "" if st.session_state.should_clear_input else st.session_state.get("question_input", "")

# Chat input area with callback
question = st.text_input(
    "", 
    value=default_value,
    placeholder="Ask a question about i2e Consulting...", 
    key="question_input"
)

# Reset the clear flag after the widget is rendered
if st.session_state.should_clear_input:
    st.session_state.should_clear_input = False

# Two-column layout for buttons
col1, col2 = st.columns([1, 5])
with col1:
    submit_button = st.button("Send", use_container_width=True, on_click=handle_input)
with col2:
    if st.button("Clear Chat", use_container_width=True):
        st.session_state.chat_history = []
        st.session_state.should_clear_input = True
        st.rerun()

# Process input when button is clicked or Enter is pressed
if submit_button or ('current_question' in st.session_state and st.session_state.current_question):
    # Get the question from session state
    current_question = st.session_state.get('current_question', question)
    
    if current_question:
        # Add user question to chat history
        st.session_state.chat_history.append({
            "role": "user",
            "content": current_question,
            "timestamp": time.time()
        })
        
        # Display user question
        st.markdown(f"""
        <div class="chat-message-user">
            <strong>You:</strong><br>
            {current_question}
        </div>
        """, unsafe_allow_html=True)
        
        # Display typing indicator
        typing_indicator = st.empty()
        typing_indicator.markdown("""
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
        """, unsafe_allow_html=True)

        # Get streaming response from API
        response_text, response_sources = stream_response(current_question)
        
        # Clear typing indicator
        typing_indicator.empty()

        # Add bot response to chat history
        if response_text:
            st.session_state.chat_history.append({
                "role": "bot",
                "content": response_text,
                "sources": response_sources,
                "timestamp": time.time()
            })
        
        # Clear current question from session state
        if 'current_question' in st.session_state:
            del st.session_state.current_question

# Display chat history with enhanced styling (for existing messages only)
st.markdown("---")
chat_container = st.container()

with chat_container:
    # Only display previous messages from history (current message is handled above)
    if len(st.session_state.chat_history) < 2:  # Less than a QA pair
        if not submit_button and question == "":  # Only show this when not processing a new question
            st.markdown("Start the conversation by asking a question above.")
    else:
        # Display all messages except the most recent pair if we just processed a new question
        display_messages = st.session_state.chat_history
        if submit_button or ('current_question' in st.session_state and st.session_state.current_question):
            display_messages = st.session_state.chat_history[:-2]
            
        for message in display_messages:
            if message['role'] == 'user':
                st.markdown(f"""
                <div class="chat-message-user">
                    <strong>You:</strong><br>
                    {message['content']}
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="chat-message-bot">
                    <strong>i2e Chatbot:</strong><br>
                    {message['content']}
                </div>
                """, unsafe_allow_html=True)
                
                # Display sources if available
                if message.get('sources'):
                    source_html = "<div class='source-link'><strong>Sources:</strong><br>"
                    for source in message['sources']:
                        source_html += f"<a href='{source}' target='_blank'>{source}</a><br>"
                    source_html += "</div>"
                    st.markdown(source_html, unsafe_allow_html=True)

