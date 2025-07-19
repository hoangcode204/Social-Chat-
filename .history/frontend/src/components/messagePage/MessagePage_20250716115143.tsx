import {Avatar, IconButton, InputAdornment, Menu, MenuItem, TextField, Button, Dialog, DialogTitle, DialogActions} from "@mui/material";
import {getChatName, getInitialsFromName} from "../utils/Utils";
import React, {useEffect, useRef, useState} from "react";
import {ChatDTO} from "../../redux/chat/ChatModel";
import {UserDTO} from "../../redux/auth/AuthModel";
import styles from './MesaggePage.module.scss';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {MessageDTO} from "../../redux/message/MessageModel";
import MessageCard from "../messageCard/MessageCard";
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from "@mui/icons-material/Clear";
import {AppDispatch} from "../../redux/Store";
import {useDispatch} from "react-redux";
import {deleteChat} from "../../redux/chat/ChatAction";
import {TOKEN} from "../../config/Config";
import EmojiPicker from "emoji-picker-react";
import MoodIcon from '@mui/icons-material/Mood';
import {EmojiClickData} from "emoji-picker-react/dist/types/exposedTypes";
import VideoCall from "../videoCall/VideoCall";
import VideocamIcon from '@mui/icons-material/Videocam';
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";

interface MessagePageProps {
    chat: ChatDTO;
    reqUser: UserDTO | null;
    messages: MessageDTO[];
    newMessage: string;
    setNewMessage: (newMessage: string) => void;
    onSendMessage: () => void;
    setIsShowEditGroupChat: (isShowEditGroupChat: boolean) => void;
    setCurrentChat: (chat: ChatDTO | null) => void;
}

const MessagePage = (props: MessagePageProps) => {

    const [messageQuery, setMessageQuery] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [anchor, setAnchor] = useState(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
    const lastMessageRef = useRef<null | HTMLDivElement>(null);
    const dispatch: AppDispatch = useDispatch();
    const open = Boolean(anchor);
    const token: string | null = localStorage.getItem(TOKEN);
    const [showVideoCall, setShowVideoCall] = useState<boolean>(false);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [signalClient, setSignalClient] = useState<Client | null>(null);

    // Kết nối signaling WebSocket để lắng nghe offer
    useEffect(() => {
        const sock = new SockJS(process.env.REACT_APP_SIGNAL_URL || "http://localhost:8080/ws");
        const client = over(sock);
        client.connect({}, () => {
            client.subscribe(`/topic/signal/room/${props.chat.id}`, (msg: any) => {
                const data = JSON.parse(msg.body);
                console.log('SIGNAL RECEIVED:', data, 'Current user:', props.reqUser?.id);
                if (data.type === "offer" && data.senderId !== props.reqUser?.id) {
                    console.log('INCOMING CALL OFFER DETECTED:', data);
                    setIncomingCall(data);
                }
            });
        });
        setSignalClient(client);
        return () => {
            if (client.connected) client.disconnect(() => {});
        };
        // eslint-disable-next-line
    }, [props.chat.id, props.reqUser?.id]);

    const handleAcceptCall = () => {
        setShowVideoCall(true);
        setIncomingCall(null);
    };
    const handleDeclineCall = () => {
        // Gửi message từ chối nếu muốn
        setIncomingCall(null);
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.messages]);

    const scrollToBottom = () => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({behavior: "smooth"});
        }
    };

    const onOpenMenu = (e: any) => {
        setAnchor(e.currentTarget);
    };

    const onCloseMenu = () => {
        setAnchor(null);
    };

    const onEditGroupChat = () => {
        onCloseMenu();
        props.setIsShowEditGroupChat(true);
    };

    const onDeleteChat = () => {
        onCloseMenu();
        if (token) {
            dispatch(deleteChat(props.chat.id, token));
            props.setCurrentChat(null);
        }
    };

    const onChangeNewMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsEmojiPickerOpen(false);
        props.setNewMessage(e.target.value);
    };

    const onChangeMessageQuery = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageQuery(e.target.value.toLowerCase());
    };

    const onChangeSearch = () => {
        setIsSearch(!isSearch);
    };

    const onClearQuery = () => {
        setMessageQuery("");
        setIsSearch(false);
    };

    const getSearchEndAdornment = () => {
        return <InputAdornment position='end'>
            <IconButton onClick={onClearQuery}>
                <ClearIcon/>
            </IconButton>
        </InputAdornment>
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            props.onSendMessage();
        }
    };

    const onOpenEmojiPicker = () => {
        setIsEmojiPickerOpen(true);
    };

    const onCloseEmojiPicker = () => {
        setIsEmojiPickerOpen(false);
    };

    const onEmojiClick = (e: EmojiClickData) => {
        setIsEmojiPickerOpen(false);
        props.setNewMessage(props.newMessage + e.emoji);
    };

    let lastDay = -1;
    let lastMonth = -1;
    let lastYear = -1;

    // Sắp xếp tin nhắn theo thời gian tăng dần
    const sortedMessages = [...props.messages].sort(
        (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
    );

    const getMessageCard = (message: MessageDTO) => {
        const date: Date = new Date(message.timeStamp);
        const isNewDate = lastDay !== date.getDate() || lastMonth !== date.getMonth() || lastYear !== date.getFullYear();
        if (isNewDate) {
            lastDay = date.getDate();
            lastMonth = date.getMonth();
            lastYear = date.getFullYear();
        }
        return <MessageCard message={message} reqUser={props.reqUser} key={message.id} isNewDate={isNewDate}
                            isGroup={props.chat.isGroup}/>
    };

    return (
        <div className={styles.outerMessagePageContainer}>

            {/*Message Page Header*/}
            <div className={styles.messagePageHeaderContainer}>
                <div className={styles.messagePageInnerHeaderContainer}>
                    <div className={styles.messagePageHeaderNameContainer}>
                        <Avatar sx={{
                            width: '2.5rem',
                            height: '2.5rem',
                            fontSize: '1rem',
                            mr: '0.75rem'
                        }}>
                            {getInitialsFromName(getChatName(props.chat, props.reqUser))}
                        </Avatar>
                        <p>{getChatName(props.chat, props.reqUser)}</p>
                    </div>
                    <div className={styles.messagePageHeaderNameContainer}>
                        {!isSearch &&
                            <IconButton onClick={onChangeSearch}>
                                <SearchIcon/>
                            </IconButton>}
                        {isSearch &&
                            <TextField
                                id='searchMessages'
                                type='text'
                                label='Search for messages ...'
                                size='small'
                                fullWidth
                                value={messageQuery}
                                onChange={onChangeMessageQuery}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <SearchIcon/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: getSearchEndAdornment(),
                                }}
                                InputLabelProps={{
                                    shrink: isFocused || messageQuery.length > 0,
                                    style: {marginLeft: isFocused || messageQuery.length > 0 ? 0 : 30}
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}/>}
                        <IconButton onClick={() => setShowVideoCall(true)}>
                            <VideocamIcon/>
                        </IconButton>
                        <IconButton onClick={onOpenMenu}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchor}
                            open={open}
                            onClose={onCloseMenu}
                            MenuListProps={{'aria-labelledby': 'basic-button'}}>
                            {props.chat.isGroup && <MenuItem onClick={onEditGroupChat}>Edit Group Chat</MenuItem>}
                            <MenuItem onClick={onDeleteChat}>
                                {props.chat.isGroup ? 'Delete Group Chat' : 'Delete Chat'}
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>

            {/*Message Page Content*/}
            <div className={styles.messageContentContainer} onClick={onCloseEmojiPicker}>
                {messageQuery.length > 0 &&
                    sortedMessages.filter(x => x.content.toLowerCase().includes(messageQuery))
                        .map(message => getMessageCard(message))}
                {messageQuery.length === 0 &&
                    sortedMessages.map(message => getMessageCard(message))}
                <div ref={lastMessageRef}></div>
            </div>

            {/*Message Page Footer*/}
            <div className={styles.footerContainer}>
                {isEmojiPickerOpen ?
                    <div className={styles.emojiOuterContainer}>
                        <div className={styles.emojiContainer}>
                            <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled={true} skinTonesDisabled={true}/>
                        </div>
                    </div> :
                    <div className={styles.emojiButton}>
                        <IconButton onClick={onOpenEmojiPicker}>
                            <MoodIcon/>
                        </IconButton>
                    </div>}
                <div className={styles.innerFooterContainer}>
                    <TextField
                        id='newMessage'
                        type='text'
                        label='Enter new message ...'
                        size='small'
                        onKeyDown={onKeyDown}
                        fullWidth
                        value={props.newMessage}
                        onChange={onChangeNewMessage}
                        sx={{backgroundColor: 'white'}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton onClick={props.onSendMessage}>
                                        <SendIcon/>
                                    </IconButton>
                                </InputAdornment>),
                        }}/>
                </div>
            </div>
            {showVideoCall && <VideoCall chatId={props.chat.id} self={props.reqUser} onClose={() => setShowVideoCall(false)} incomingOffer={incomingCall} />}
            <Dialog open={!!incomingCall} onClose={handleDeclineCall}>
                <DialogTitle>Incoming Video Call</DialogTitle>
                <DialogActions>
                    <Button onClick={handleAcceptCall} variant="contained" color="primary">Accept</Button>
                    <Button onClick={handleDeclineCall} variant="outlined" color="error">Decline</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MessagePage;