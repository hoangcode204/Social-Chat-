import {MessageReducerState} from "./MessageModel";
import {Action} from "../CommonModel";
import * as actionTypes from './MessageActionType';

const initialState: MessageReducerState = {
    messages: [],
    newMessage: null,
};

const messageReducer = (state: MessageReducerState = initialState, action: Action): MessageReducerState => {
    switch (action.type) {
        case actionTypes.CREATE_NEW_MESSAGE:
            // Nếu đã có messages, cập nhật message mới vào danh sách
            if (state.messages && state.messages.length > 0) {
                const updatedMessages = state.messages.map(msg =>
                    msg.id === action.payload.id ? action.payload : msg
                );
                // Nếu message mới chưa có trong list, thêm vào cuối
                const exists = state.messages.some(msg => msg.id === action.payload.id);
                return {
                    ...state,
                    messages: exists ? updatedMessages : [...state.messages, action.payload],
                    newMessage: action.payload
                };
            }
            return {...state, newMessage: action.payload};
        case actionTypes.GET_ALL_MESSAGES:
            return {...state, messages: action.payload};
    }
    return state;
};

export default messageReducer;