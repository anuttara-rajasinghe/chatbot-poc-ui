-- Add DELETE policies for chat_sessions table
CREATE POLICY "Anyone can delete chat sessions"
ON public.chat_sessions
FOR DELETE
USING (true);

-- Add DELETE policies for chat_messages table  
CREATE POLICY "Anyone can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (true);