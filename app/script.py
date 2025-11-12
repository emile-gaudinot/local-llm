import sys
import time
from ollama import chat
from ollama import ChatResponse


def main(model_name, prompt):
    elapsed_time = time.time()
    response: ChatResponse = chat(
        model=model_name, 
        messages=[{
            'role': 'user',
            'content': prompt,
        }],
        stream=True
    )
    for chunk in response:
        print(chunk['message']['content'], end='', flush=True)

    # Print time
    elapsed_time = time.time() - elapsed_time
    minutes, seconds = divmod(elapsed_time, 60)
    execution_time = f"\n{int(minutes)}min {int(seconds)}s"
    print(execution_time, ' | ', model_name)


if __name__ == '__main__':
    assert len(sys.argv) == 2, f"{sys.argv}"
    main(model_name=sys.argv[1], prompt=sys.stdin.read())