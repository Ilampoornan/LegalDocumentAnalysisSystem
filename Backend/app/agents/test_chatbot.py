import unittest
from unittest.mock import AsyncMock, patch, MagicMock
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage

# Patch the retrieve and vector_store modules before importing chatbot
with patch.dict('sys.modules', {
    'app.tools.retrieve': MagicMock(),
    'app.services.vector_store': MagicMock()
}):
    from app.agents.chatbot import query_or_respond


class TestQueryOrRespond(unittest.IsolatedAsyncioTestCase):


   
    # Test_query_or_respond_no_tool_invoked()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_no_tool_invoked(self, mock_retrieve, mock_init_chat_model):
        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.return_value = AsyncMock(
            tool_calls=[],
            content="This is a direct response."
        )
        mock_init_chat_model.return_value = mock_llm

        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="What is the capital of France?")
        ]

        response = await query_or_respond(messages)

        self.assertEqual(response, "This is a direct response.")
        mock_llm.ainvoke.assert_called_once_with(messages)
        mock_retrieve.assert_not_called()


    # Test_query_or_respond_with_tool_invoked()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_with_tool_invoked(self, mock_retrieve, mock_init_chat_model):
        tool_call_id = "call_123"

        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.side_effect = [
            AsyncMock(
                tool_calls=[{
                    "name": "retrieve",
                    "args": {"query": "five great debates"},
                    "id": tool_call_id
                }],
                content="Tool invocation response."
            ),
            AsyncMock(content="Final response based on context.")
        ]
        mock_init_chat_model.return_value = mock_llm
        mock_retrieve.return_value = "Retrieved context about debates."

        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Tell me about the five great debates.")
        ]

        response = await query_or_respond(messages)

        self.assertEqual(response, "Final response based on context.")
        mock_retrieve.assert_called_once_with("five great debates")
        self.assertEqual(mock_llm.ainvoke.call_count, 2)

        # Second call structure check
        second_call_args = mock_llm.ainvoke.call_args_list[1][0][0]
        self.assertIn("Context from documents:", second_call_args)


    
    # Test_query_or_respond_empty_input()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_empty_input(self, mock_retrieve, mock_init_chat_model):
        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.return_value = AsyncMock(tool_calls=[], content="Empty input.")
        mock_init_chat_model.return_value = mock_llm

        response = await query_or_respond([])
        self.assertEqual(response, "Empty input.")
        mock_llm.ainvoke.assert_called_once()


        
    # Test_query_or_respond_malformed_tool_call()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_malformed_tool_call(self, mock_retrieve, mock_init_chat_model):
        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.return_value = AsyncMock(
            tool_calls=[{"name": "retrieve"}],
            content="Bad tool call"
        )
        mock_init_chat_model.return_value = mock_llm

        response = await query_or_respond([
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="What is AI?")
        ])
        self.assertEqual(response, "Bad tool call")
        mock_retrieve.assert_not_called()



    # Test_query_or_respond_tool_call_id_not_found()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_retrieve_returns_empty(self, mock_retrieve, mock_init_chat_model):
        tool_call_id = "call_456"

        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.side_effect = [
            AsyncMock(tool_calls=[{
                "name": "retrieve",
                "args": {"query": "history of law"},
                "id": tool_call_id
            }], content="Tool call."),
            AsyncMock(content="Fallback response due to empty retrieve.")
        ]
        mock_init_chat_model.return_value = mock_llm
        mock_retrieve.return_value = ""

        response = await query_or_respond([
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Give a brief history of law.")
        ])
        self.assertEqual(response, "Fallback response due to empty retrieve.")
        mock_retrieve.assert_called_once_with("history of law")


    #Test_query_or_respond_long_conversation()

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_long_conversation(self, mock_retrieve, mock_init_chat_model):
        tool_call_id = "call_902"

        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.side_effect = [
            AsyncMock(
                tool_calls=[{
                    "name": "retrieve",
                    "args": {"query": "long history"},
                    "id": tool_call_id
                }],
                content="Tool invocation response."
            ),
            AsyncMock(content="Final response for long conversation.")
        ]
        mock_init_chat_model.return_value = mock_llm
        mock_retrieve.return_value = "Retrieved long context."

        # Create a long conversation history
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            HumanMessage(content="Tell me something."),
            AIMessage(content="Sure, what?"),
            HumanMessage(content="More details."),
            AIMessage(content="About what?"),
            HumanMessage(content="Tell me about a long history.")
        ]

        response = await query_or_respond(messages)

        self.assertEqual(response, "Final response for long conversation.")
        mock_retrieve.assert_called_once_with("long history")
        self.assertEqual(mock_llm.ainvoke.call_count, 2)
        second_call_args = mock_llm.ainvoke.call_args_list[1][0][0]
        self.assertIn("Context from documents:", second_call_args)
        self.assertIn("Retrieved long context.", second_call_args)
        self.assertIn("Tell me about a long history.", second_call_args)

    @patch("app.agents.chatbot.init_chat_model")
    @patch("app.agents.chatbot.retrieve")
    async def test_query_or_respond_invalid_message_type(self, mock_retrieve, mock_init_chat_model):
        mock_llm = AsyncMock()
        mock_llm.bind_tools = AsyncMock(return_value=mock_llm)
        mock_llm.ainvoke.return_value = AsyncMock(
            tool_calls=[],
            content="Response to invalid message."
        )
        mock_init_chat_model.return_value = mock_llm

        # Use a non-standard message type (e.g., a plain dict)
        messages = [
            SystemMessage(content="You are a helpful assistant."),
            {"content": "Invalid message"}  # Invalid message type
        ]

        response = await query_or_respond(messages)

        self.assertEqual(response, "Response to invalid message.")
        mock_llm.ainvoke.assert_called_once()
        mock_retrieve.assert_not_called()



 


if __name__ == "__main__":
    unittest.main()