import sys
import time
from torch import float32, bfloat16, float16, float8_e4m3fn, float8_e5m2
from mistral_inference.transformer import Transformer # type: ignore
from mistral_inference.generate import generate # type: ignore
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer # type: ignore
from mistral_common.protocol.instruct.messages import UserMessage # type: ignore
from mistral_common.protocol.instruct.request import ChatCompletionRequest # type: ignore


def main(model_name, prompt, float_precision):
    # Select float precision
    FLOAT_PRECISION = {
        "float32": float32,
        "bfloat16": bfloat16,
        "float16": float16,
        "float8_e4m3fn": float8_e4m3fn,
        "float8_e5m2": float8_e5m2,
    }[float_precision]

    # Update model and tokenizer paths based on the selected model name
    FILE_MODEL = {
        "Mistral7B": "../mistral_models/Mistral-7B-Instruct-v0.1/",
        "Codestral": "../mistral_models/codestral-mamba-7B-v0.1/",
        "Mathstral": "../mistral_models/mathstral-7B-v0.1/"
    }[model_name]
    FILE_TOKENIZER = FILE_MODEL + "tokenizer.model.v3"

    # Get model
    elapsed_time = time.time()
    tokenizer = MistralTokenizer.from_file(FILE_TOKENIZER)  # change to extracted tokenizer file
    model = Transformer.from_folder(FILE_MODEL, dtype=FLOAT_PRECISION)  # change to extracted model dir
    # Get answer
    completion_request = ChatCompletionRequest(messages=[UserMessage(content=prompt)])
    tokens = tokenizer.encode_chat_completion(completion_request).tokens
    out_tokens, _ = generate([tokens], model, max_tokens=1024, temperature=0.35, eos_id=tokenizer.instruct_tokenizer.tokenizer.eos_id)
    answer = tokenizer.instruct_tokenizer.tokenizer.decode(out_tokens[0])
    # Print answer and time
    print(answer)
    elapsed_time = time.time() - elapsed_time
    minutes, seconds = divmod(elapsed_time, 60)
    execution_time = f"\n{int(minutes)}min {int(seconds)}s"
    print(execution_time, ' | ', model_name, ' | ', float_precision)


if __name__ == '__main__':
    assert len(sys.argv) == 4, f"{sys.argv}"
    main(sys.argv[1], sys.argv[2], sys.argv[3])