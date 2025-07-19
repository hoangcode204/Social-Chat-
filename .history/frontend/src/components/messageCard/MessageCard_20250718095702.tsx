import {MessageDTO} from "../../redux/message/MessageModel";
import {UserDTO} from "../../redux/auth/AuthModel";
import styles from './MessageCard.module.scss';
import {Chip} from "@mui/material";
import React from "react";
import {getDateFormat} from "../utils/Utils";
import { useDispatch } from "react-redux";
import { reactToMessage } from "../../redux/message/MessageAction";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReplyIcon from "@mui/icons-material/Reply";
import { IconButton, Tooltip } from "@mui/material";

interface MessageCardProps {
    message: MessageDTO;
    reqUser: UserDTO | null;
    isNewDate: boolean;
    isGroup: boolean;
    onReply?: (message: MessageDTO) => void;
}

const MessageCard = (props: MessageCardProps) => {

    const isOwnMessage = props.message.user.id === props.reqUser?.id;
    const date: Date = new Date(props.message.timeStamp);
    const hours = date.getHours() > 9 ? date.getHours().toString() : "0" + date.getHours();
    const minutes = date.getMinutes() > 9 ? date.getMinutes().toString() : "0" + date.getMinutes();
    const label: React.ReactElement = (
        <div className={styles.bubbleContainer}>
            {props.isGroup && !isOwnMessage && <h4 className={styles.contentContainer}>{props.message.user.fullName}:</h4>}
            <p className={styles.contentContainer}>{props.message.content}</p>
            <p className={styles.timeContainer}>{hours + ":" + minutes}</p>
        </div>
    );

    const dateLabel: React.ReactElement = (
      <p>{getDateFormat(date)}</p>
    );

    const dispatch = useDispatch();
    const token = localStorage.getItem('token') || '';

    // Xử lý react
    const handleReact = (reaction: string) => {
        if (!props.reqUser) return;
        const hasReacted = props.message.reactions?.[reaction]?.includes(props.reqUser.id) || false;
        dispatch<any>(reactToMessage(props.message.id, reaction, !hasReacted, token));
    };

    // Xử lý reply
    const handleReply = () => {
        if (props.onReply) props.onReply(props.message);
    };

    // Hiển thị reactions
    const renderReactions = () => {
        if (!props.message.reactions) return null;
        return (
            <div className={styles.reactionsContainer}>
                {Object.entries(props.message.reactions).map(([type, users]) => (
                    <span key={type} className={styles.reactionItem}>{type} {users.length}</span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.messageCardInnerContainer}>
            {props.isNewDate && <div className={styles.date}>{<Chip label={dateLabel}
                                                                    sx={{height: 'auto', width: 'auto', backgroundColor: '#faebd7'}}/>}</div>}
            <div className={isOwnMessage ? styles.ownMessage : styles.othersMessage}>
                {/* Nếu là reply, hiển thị phần trích dẫn */}
                {props.message.replyTo && (
                    <div className={styles.replyPreview}>
                        <span>Reply to: {props.message.replyTo.user?.fullName}: {props.message.replyTo.content}</span>
                    </div>
                )}
                <Chip label={label}
                      sx={{height: 'auto', width: 'auto', backgroundColor: isOwnMessage ? '#d3fdd3' : 'white', ml: '0.75rem'}}/>
                <div className={styles.actionRow}>
                    <Tooltip title="React">
                        <IconButton onClick={() => handleReact('❤️')} size="small">
                            <FavoriteIcon color="error" fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reply">
                        <IconButton onClick={handleReply} size="small">
                            <ReplyIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </div>
                {renderReactions()}
            </div>
        </div>
    );
};

export default MessageCard;