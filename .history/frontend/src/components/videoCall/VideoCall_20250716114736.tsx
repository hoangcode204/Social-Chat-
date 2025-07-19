import React, { useEffect, useRef, useState } from "react";
import { UserDTO } from "../../redux/auth/AuthModel";
import { Button, IconButton } from "@mui/material";
import CallEndIcon from '@mui/icons-material/CallEnd';
import styles from "./VideoCall.module.scss";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";

interface VideoCallProps {
    chatId: string;
    self: UserDTO | null;
    onClose: () => void;
    incomingOffer?: any;
}

const SIGNAL_URL = process.env.REACT_APP_SIGNAL_URL || "http://localhost:8080/ws";

const VideoCall: React.FC<VideoCallProps> = ({ chatId, self, onClose, incomingOffer }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [callActive, setCallActive] = useState(false);
    const [isCaller, setIsCaller] = useState(false);

    // ICE servers config (use public STUN for demo)
    const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    // Start signaling connection
    useEffect(() => {
        const sock = new SockJS(SIGNAL_URL);
        const client = over(sock);
        client.connect({}, () => {
            client.subscribe(`/topic/signal/room/${chatId}`, onSignalReceived);
            setStompClient(client); // Đặt sau khi connect thành công
        });
        return () => {
            if (client.connected) {
                client.disconnect(() => {});
            }
        };
        // eslint-disable-next-line
    }, [chatId]);

    // Start local stream
    useEffect(() => {
        if (callActive) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                    if (peerConnection) {
                        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
                    }
                });
        }
        // eslint-disable-next-line
    }, [callActive, peerConnection]);

    // Handle signaling messages
    const onSignalReceived = (msg: any) => {
        const data = JSON.parse(msg.body);
        if (!peerConnection) return;
        if (data.type === "offer" && !isCaller) {
            peerConnection.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: data.sdp }));
            peerConnection.createAnswer().then(answer => {
                peerConnection.setLocalDescription(answer);
                sendSignal({ type: "answer", sdp: answer.sdp });
            });
        } else if (data.type === "answer" && isCaller) {
            peerConnection.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
        } else if (data.type === "candidate") {
            peerConnection.addIceCandidate(new RTCIceCandidate({ candidate: data.candidate }));
        }
    };

    // Send signaling message
    const sendSignal = (msg: any) => {
        if (!stompClient || !self || !stompClient.connected) return;
        stompClient.send("/app/signal", {}, JSON.stringify({
            ...msg,
            roomId: chatId,
            senderId: self.id
        }));
    };

    // Start call (as caller)
    const startCall = () => {
        setIsCaller(true);
        setCallActive(true);
        const pc = new RTCPeerConnection(iceServers);
        setPeerConnection(pc);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({ type: "candidate", candidate: event.candidate.candidate });
            }
        };
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                pc.createOffer().then(offer => {
                    pc.setLocalDescription(offer);
                    sendSignal({ type: "offer", sdp: offer.sdp });
                });
            });
    };

    // Accept call (as callee)
    useEffect(() => {
        if (!callActive && !isCaller && stompClient) {
            const pc = new RTCPeerConnection(iceServers);
            setPeerConnection(pc);
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal({ type: "candidate", candidate: event.candidate.candidate });
                }
            };
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
            setCallActive(true);
        }
        // eslint-disable-next-line
    }, [stompClient]);

    // Khi nhận offer (callee Accept), tự động xử lý offer, tạo answer
    useEffect(() => {
        if (incomingOffer && !isCaller) {
            const pc = new RTCPeerConnection(iceServers);
            setPeerConnection(pc);
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal({ type: "candidate", candidate: event.candidate.candidate });
                }
            };
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));
                    pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: incomingOffer.sdp }))
                        .then(() => pc.createAnswer())
                        .then(answer => {
                            pc.setLocalDescription(answer);
                            sendSignal({ type: "answer", sdp: answer.sdp });
                        });
                });
            setCallActive(true);
        }
        // eslint-disable-next-line
    }, [incomingOffer]);

    // End call
    const endCall = () => {
        setCallActive(false);
        setIsCaller(false);
        if (peerConnection) {
            peerConnection.close();
        }
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
            (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            remoteVideoRef.current.srcObject = null;
        }
        onClose();
    };

    return (
        <div className={styles.videoCallOverlay}>
            <div className={styles.videoContainer}>
                <video ref={localVideoRef} autoPlay muted className={styles.localVideo}/>
                <video ref={remoteVideoRef} autoPlay className={styles.remoteVideo}/>
            </div>
            <div className={styles.callControls}>
                {!callActive && <Button variant="contained" color="primary" onClick={startCall}>Start Call</Button>}
                <IconButton color="error" onClick={endCall}><CallEndIcon/></IconButton>
            </div>
        </div>
    );
};

export default VideoCall; 