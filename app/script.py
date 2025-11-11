import sys
import time
from ollama import chat
from ollama import ChatResponse


def main(model_name, prompt):
    elapsed_time = time.time()
    response: ChatResponse = chat(model=model_name, messages=[
        {
            'role': 'user',
            'content': prompt,
        },
    ])
    answer = response.message.content
    # print(response['message']['content'])
    print(answer)

    # Print answer and time
    elapsed_time = time.time() - elapsed_time
    minutes, seconds = divmod(elapsed_time, 60)
    execution_time = f"\n{int(minutes)}min {int(seconds)}s"
    print(execution_time, ' | ', model_name)


if __name__ == '__main__':
    assert len(sys.argv) == 3, f"{sys.argv}"
    main(sys.argv[1], sys.argv[2])