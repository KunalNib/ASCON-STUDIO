import asyncio
from rag import AssistantRAG

async def test():
    rag = AssistantRAG()
    async for chunk in rag.query_stream("hello", context={}):
        print(chunk)

asyncio.run(test())
