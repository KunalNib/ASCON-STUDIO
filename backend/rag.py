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
            "Use the following ASCON facts to answer the user's question accurately:\n"
            "- ASCON won the NIST Lightweight Cryptography (LWC) competition.\n"
            "- It uses a Sponge Construction with a 320-bit internal state (five 64-bit words: x0, x1, x2, x3, x4).\n"
            "- Key and Nonce are both 128-bit. The Authentication Tag is also 128-bit.\n"
            "- Initialization: Key, Nonce, and IV are loaded. Runs 12 permutation rounds (pa).\n"
            "- Associated Data (AD): Absorbed into the state without encryption using 6 or 8 rounds (pb).\n"
            "- Plaintext Encryption: XORed into the state to produce ciphertext, then mixed using pb.\n"
            "- Permutation operations: (1) pc (Addition of Constants) breaks symmetry. (2) ps (Substitution Layer) uses a 5-bit S-box for non-linearity. (3) pl (Linear Diffusion Layer) uses bitwise rotations and XORs for the avalanche effect.\n"
            "- Finalization: The key is injected twice (before and after 12 rounds of pa) to prevent length-extension attacks. The tag is extracted from x3 and x4.\n\n"
            "Explain concepts clearly, and be EXTREMELY concise. "
            "DO NOT give long introductory overviews. Directly answer the question in ideally 1-3 sentences maximum."
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

    def generate_quiz_set(self, count: int = 10):
        """
        Uses Ollama to generate a JSON array of `count` cryptography questions.
        Falls back to a hardcoded set of 10 diverse ASCON questions if the LLM
        is offline or fails to return valid JSON.
        """
        fallback_questions = [
            {
                "question": "In the ASCON permutation, what is the primary purpose of the Addition of Constants (pc) layer?",
                "options": [
                    "To compress the ciphertext into a tag",
                    "To add non-linearity via S-box substitution",
                    "To provide round-specific asymmetry preventing rotational cryptanalysis",
                    "To expand the 128-bit key into the 320-bit state"
                ],
                "correct_index": 2,
                "explanation": "The round constants inject different values each round so that mirrored internal states immediately diverge, defeating rotational and slide attacks."
            },
            {
                "question": "How large is the ASCON internal state in bits?",
                "options": ["128 bits", "256 bits", "320 bits", "512 bits"],
                "correct_index": 2,
                "explanation": "ASCON uses a 320-bit state organised as five 64-bit words (x0–x4), giving its sponge construction a rate plus capacity totalling 320 bits."
            },
            {
                "question": "Which layer of the ASCON permutation is responsible for non-linear mixing?",
                "options": [
                    "Linear Diffusion Layer (pl)",
                    "Addition of Constants Layer (pc)",
                    "Substitution Layer — the 5-bit S-box (ps)",
                    "Key Schedule"
                ],
                "correct_index": 2,
                "explanation": "The S-box (ps) applies a 5-bit non-linear substitution to every column of the state, providing confusion and making the cipher resistant to linear cryptanalysis."
            },
            {
                "question": "In ASCON-128, how many permutation rounds are used during the Initialization phase?",
                "options": ["6 rounds", "8 rounds", "10 rounds", "12 rounds"],
                "correct_index": 3,
                "explanation": "The Initialization (and Finalization) phases apply pa = 12 rounds to thoroughly mix the IV, key, and nonce into the state before any data is absorbed."
            },
            {
                "question": "What distinguishes ASCON-128 from ASCON-128a in terms of performance?",
                "options": [
                    "ASCON-128a uses a 256-bit key instead of 128-bit",
                    "ASCON-128a absorbs a 128-bit rate per block versus 64-bit in ASCON-128",
                    "ASCON-128a uses 12 rounds for both initialization and data processing",
                    "ASCON-128a operates on 512-bit state"
                ],
                "correct_index": 1,
                "explanation": "ASCON-128a has a rate of 128 bits (two 64-bit words), allowing it to absorb twice as much data per permutation call, making it faster for longer messages."
            },
            {
                "question": "What is the purpose of the nonce in ASCON-128 authenticated encryption?",
                "options": [
                    "It replaces the secret key for lightweight encryption",
                    "It guarantees uniqueness of each encryption, preventing ciphertext reuse attacks",
                    "It is XORed with the plaintext to produce ciphertext directly",
                    "It expands the rate from 64 to 128 bits"
                ],
                "correct_index": 1,
                "explanation": "A unique 128-bit nonce per message ensures that even identical plaintexts encrypted with the same key produce different ciphertexts, defeating replay attacks."
            },
            {
                "question": "The Linear Diffusion layer in ASCON uses rotational XOR operations. What property does this achieve?",
                "options": [
                    "Key expansion from 128 to 320 bits",
                    "Non-linear mixing across the state words",
                    "Spreading a single-bit change across the entire 64-bit word (diffusion)",
                    "Absorbing associated data into the rate"
                ],
                "correct_index": 2,
                "explanation": "pl XORs each word with two rotated copies of itself, ensuring that changing one bit ripples across all 64 positions of that word — achieving the avalanche effect."
            },
            {
                "question": "Why was ASCON selected by NIST as the primary standard for lightweight cryptography?",
                "options": [
                    "It offers the highest security margin of any AEAD cipher",
                    "It is a block cipher optimised for 64-bit server CPUs",
                    "Its compact sponge design achieves excellent performance on constrained IoT hardware",
                    "It is backward-compatible with AES-GCM"
                ],
                "correct_index": 2,
                "explanation": "ASCON's sponge-based AEAD is specifically engineered for microcontrollers and RFID tags where memory, power, and silicon area are severely limited — the core IoT use case targeted by NIST's LWC competition."
            },
            {
                "question": "During ASCON's Finalization phase, what secret material is XORed into the state before extracting the tag?",
                "options": [
                    "The plaintext message",
                    "The associated data",
                    "The 128-bit secret key (injected twice at rate and capacity boundaries)",
                    "The nonce"
                ],
                "correct_index": 2,
                "explanation": "Finalization XORs the key into the lower capacity words then applies pa permutation and XORs the key again into the final two words, binding the tag cryptographically to the secret key."
            },
            {
                "question": "In the ASCON sponge construction, what is the 'capacity' portion of the state?",
                "options": [
                    "The bits that are directly XORed with input data each block",
                    "The secret bits that are never directly exposed to plaintext/ciphertext, providing security",
                    "The portion used to store the authentication tag",
                    "The initialisation vector mixed with the key"
                ],
                "correct_index": 1,
                "explanation": "The capacity (320 − rate bits) is kept hidden — it is never directly XORed with external data. Its size determines the security level: 256 bits for ASCON-128."
            }
        ]

        if not self.llm:
            return fallback_questions[:count]

        prompt = (
            f"You are a Cryptography professor testing a student on ASCON lightweight authenticated encryption. "
            f"Generate exactly {count} multiple-choice questions that cover different aspects of ASCON "
            f"(e.g., state structure, permutation layers, sponge construction, security properties, NIST selection, "
            f"ASCON variants, initialization, finalization, associated data handling). "
            f"Return EXACTLY AND ONLY a valid JSON array of {count} objects. "
            f"Each object must have these keys: "
            f"'question' (string), 'options' (array of exactly 4 strings), 'correct_index' (integer 0–3), 'explanation' (string). "
            f"Do NOT include markdown tags like ```json, numbering, or any other surrounding text."
        )

        try:
            response = self.llm.invoke(prompt)
            cleaned = response.replace("```json", "").replace("```", "").strip()
            # Find the JSON array bounds in case the LLM prepends text
            start = cleaned.find("[")
            end = cleaned.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found in LLM response")
            questions = json.loads(cleaned[start:end])
            # Validate and trim/pad to desired count
            valid = [q for q in questions if all(k in q for k in ("question", "options", "correct_index", "explanation"))]
            if len(valid) < 3:
                raise ValueError(f"Too few valid questions returned: {len(valid)}")
            return valid[:count]
        except Exception as e:
            print(f"Quiz Set Generation Error: {e}. Using fallback questions.")
            return fallback_questions[:count]

    async def agenerate_quiz_set(self, count: int = 5):
        """
        Async version of generate_quiz_set with a strict timeout.
        """
        fallback_questions = self.generate_quiz_set.__defaults__[0] if hasattr(self.generate_quiz_set, '__defaults__') else []
        # Re-define fallback questions just in case, or we can just call self.generate_quiz_set without LLM
        # To avoid duplication, let's temporarily unset self.llm and call the sync method for the fallback.
        
        if not self.llm:
            return self.generate_quiz_set(count)

        prompt = (
            f"You are a Cryptography professor testing a student on ASCON lightweight authenticated encryption. "
            f"Generate exactly {count} multiple-choice questions that cover different aspects of ASCON "
            f"(e.g., state structure, permutation layers, sponge construction, security properties, NIST selection). "
            f"Return EXACTLY AND ONLY a valid JSON array of {count} objects. "
            f"Each object must have these keys: "
            f"'question' (string), 'options' (array of exactly 4 strings), 'correct_index' (integer 0-3), 'explanation' (string). "
            f"Do NOT include markdown tags like ```json, numbering, or any other surrounding text."
        )

        try:
            import asyncio
            # Strict 25 second timeout to prevent browser NetworkErrors
            response = await asyncio.wait_for(self.llm.ainvoke(prompt), timeout=25.0)
            cleaned = response.replace("```json", "").replace("```", "").strip()
            start = cleaned.find("[")
            end = cleaned.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found in LLM response")
            import json
            questions = json.loads(cleaned[start:end])
            valid = [q for q in questions if all(k in q for k in ("question", "options", "correct_index", "explanation"))]
            if len(valid) < 3:
                raise ValueError(f"Too few valid questions returned: {len(valid)}")
            return valid[:count]
        except asyncio.TimeoutError:
            print("Quiz generation timed out (took > 25s). Serving fallback questions.")
            # Disable LLM temporarily to get fallback questions easily
            temp_llm = self.llm
            self.llm = None
            questions = self.generate_quiz_set(count)
            self.llm = temp_llm
            return questions
        except Exception as e:
            print(f"Async Quiz Set Generation Error: {e}. Using fallback questions.")
            temp_llm = self.llm
            self.llm = None
            questions = self.generate_quiz_set(count)
            self.llm = temp_llm
            return questions
