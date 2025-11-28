import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import time
from ollama import chat
from ollama import ChatResponse
import json
import tempfile


def main(model_name, messages_path):

    prompt = sys.stdin.read()
    # Load previous messages if exists
    with open(messages_path, 'r', encoding='utf-8') as f:
        messages = json.load(f)
    
    if prompt.lower() != 'exit':  
        elapsed_time = time.time()
        messages += [
            {'role': 'user', 'content': prompt}
        ]
        full_response = ""  
        response: ChatResponse = chat(  
            model=model_name,  
            messages=messages,  
            stream=True
        )
        for chunk in response:
            if chunk.message:  
                response_chunk = chunk.message.content  
                print(response_chunk, end='', flush=True)  
                full_response += response_chunk  
        # Add the exchange to the conversation history 
        messages += [  
            {'role': 'assistant', 'content': full_response},  
        ]  
        # Write messages to temp file
        with open(messages_path, 'w', encoding='utf-8') as f:
            json.dump(messages[-2:], f, ensure_ascii=False, indent=2)

    # Print time
    elapsed_time = time.time() - elapsed_time
    minutes, seconds = divmod(elapsed_time, 60)
    execution_time = f" \n{int(minutes)}min {int(seconds)}s"
    print(execution_time, ' | ', model_name)


if __name__ == '__main__':
    assert len(sys.argv) == 3, f"{sys.argv}"
    model_name = sys.argv[1]
    messages_path = sys.argv[2]
    main(model_name, messages_path)