import json
from langchain_ollama import OllamaLLM

class AssistantRAG:
    def __init__(self):
        # Connect to local Ollama instance
        try:
            self.llm = OllamaLLM(model="mistral")
            print("RAG System initialized with local Ollama.")
        except Exception as e:
            print(f"Warning: Could not initialize Ollama. Make sure it is running. Error: {e}")
            self.llm = None
        
    async def query_stream(self, text: str, context: dict = None):
        """
        Process the physical LLM query via Ollama if available. 
        Will return standard responses with simulated visual UI triggers logic appended.
        Yields streaming chunks.
        """
        
        context_str = f"Current UI State: Step={context.get('step', 'N/A')}, Mode={context.get('mode', 'N/A')}" if context else ""
        system_prompt = (
            "You are an intelligent AI Tutor for ASCON lightweight cryptography. "
            "Explain concepts clearly, and be EXTREMELY concise. "
            "DO NOT give long introductory overviews unless specifically asked. "
            "Directly answer the question in as few sentences as possible, ideally 1-3 sentences maximum."
        )
        
        full_prompt = f"{system_prompt}\n{context_str}\n\nStudent asks: {text}\n\nTutor Response:"
        
        # We can still append UI action triggers by analyzing the user's prompt text
        lower_text = text.lower()
        actions = {}
        sources = []
        
        if "s-box" in lower_text or "substitution" in lower_text:
            actions = {"open_side_panel": True, "visual_component": "SBoxVisualizer", "highlight_bits": True, "highlight": "permutation-view"}
            sources = ["ASCON Spec"]
        elif "initialization" in lower_text:
            actions = {"open_side_panel": True, "visual_component": "InitStateVisualizer", "highlight": "state-view"}
        elif "bit" in lower_text or "avalanche" in lower_text:
            actions = {"highlight": "security-view", "trigger_animation": True, "open_side_panel": True}
            sources = ["NIST SP 800-232", "Ollama LLM"]
        elif "permutation" in lower_text or "round" in lower_text:
            actions = {"highlight": "permutation-view", "step_to": 2, "open_side_panel": True}
            sources = ["Ollama LLM"]
            
        from langchain_ollama import OllamaLLM
        try:
            # Yield an initial indicator so the UI responds immediately!
            yield {"type": "chunk", "message": "*(Booting up Mistral LLM - this may take up to 60 seconds on first run...)*\n\n"}
            
            llm = OllamaLLM(model="mistral")
            # LLM execution via async stream generator
            async for chunk in llm.astream(full_prompt):
                yield {"type": "chunk", "message": chunk}
        except Exception as e:
            # Mistral isn't loaded or network error
            msg = f"Ollama execution failed (could not load mistral). Error: {str(e)}."
            yield {"type": "chunk", "message": msg}
            
        yield {
            "type": "done",
            "actions": actions,
            "sources": sources
        }

    def generate_quiz(self):
        """
        Uses Ollama to generate a JSON formatted cryptography question.
        Fallback provided if LLM is offline or fails to respect JSON structure.
        """
        fallback_quiz = {
            "question": "In the ASCON permutation, what is the primary purpose of the Addition of Constants layer?",
            "options": [
                "To compress the ciphertext",
                "To add non-linearity to the state",
                "To provide asymmetry across the rounds preventing rotational cryptanalysis",
                "To expand the initialization vector"
            ],
            "correct_index": 2,
            "explanation": "Constants mathematically asymmetry the internal state round over round, ensuring that identical column values immediately diverge, destroying symmetric vulnerabilities."
        }
        
        if not self.llm:
            return fallback_quiz
            
        prompt = (
            "You are a Cryptography professor testing a student on ASCON. "
            "Generate one multiple choice question about ASCON. "
            "Return EXACTLY AND ONLY a valid JSON object with the following keys: "
            "'question' (string), 'options' (array of 4 strings), 'correct_index' (integer 0-3), 'explanation' (string). "
            "Do not include markdown tags like ```json or any other text."
        )
        
        try:
            response = self.llm.invoke(prompt)
            # Clean up potential markdown formatting usually injected by Llama 3
            cleaned = response.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Quiz Generation Error: {e}")
            return fallback_quiz
