# NodeChatProject
This is an attempt for my client for a video and audio chat where it uses media recorder to record and send the recordings in short pulses to the other client through the server. 
The video is recorded using the webrtc api MediaRecorder and the corresponding audio chunks that are hence produced are sent as a stream through socket io to the server. The server sends this data to all the members present in the chat room. The video is streamed in the form of frames using video to canvas technique.
