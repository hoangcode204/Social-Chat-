package com.nicolas.chatapp.service.implementation;

import com.nicolas.chatapp.dto.request.GroupChatRequestDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Chat;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.ChatRepository;
import com.nicolas.chatapp.service.ChatService;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final UserService userService;
    private final ChatRepository chatRepository;

    @Override
    public Chat createChat(User reqUser, UUID userId2) throws UserException {

        User user2 = userService.findUserById(userId2);

        Optional<Chat> existingChatOptional = chatRepository.findSingleChatByUsers(user2, reqUser);

        if (existingChatOptional.isPresent()) {
            return existingChatOptional.get();
        }

        Chat chat = Chat.builder()
                .createdBy(reqUser)
                .users(new HashSet<>(Set.of(reqUser, user2)))
                .isGroup(false)
                .build();

        return chatRepository.save(chat);
    }

    @Override
    public Chat findChatById(UUID id) throws ChatException {

        Optional<Chat> chatOptional = chatRepository.findById(id);

        if (chatOptional.isPresent()) {
            return chatOptional.get();
        }

        throw new ChatException("No chat found with id " + id);
    }

    @Override
    public List<Chat> findAllByUserId(UUID userId) throws UserException {
        // 1. Lấy thông tin user từ userId
        User user = userService.findUserById(userId);
    
        // 2. Lấy tất cả các chat mà user này tham gia
        return chatRepository.findChatByUserId(user.getId()).stream()
            // 3. Sắp xếp các chat theo thời gian tin nhắn mới nhất (giảm dần)
            .sorted((chat1, chat2) -> {
                if (chat1.getMessages().isEmpty() && chat2.getMessages().isEmpty()) {
                    return 0; // Cả hai đều không có tin nhắn, giữ nguyên vị trí
                } else if (chat1.getMessages().isEmpty()) {
                    return 1; // chat1 không có tin nhắn, xếp sau chat2
                } else if (chat2.getMessages().isEmpty()) {
                    return -1; // chat2 không có tin nhắn, xếp sau chat1
                }
                // Cả hai đều có tin nhắn, so sánh thời gian tin nhắn cuối cùng
                LocalDateTime timeStamp1 = chat1.getMessages().get(chat1.getMessages().size() - 1).getTimeStamp();
                LocalDateTime timeStamp2 = chat2.getMessages().get(chat2.getMessages().size() - 1).getTimeStamp();
                return timeStamp2.compareTo(timeStamp1); // Chat nào có tin nhắn mới hơn sẽ lên trước
            })
            .toList();
    }

    @Override
    public Chat createGroup(GroupChatRequestDTO req, User reqUser) throws UserException {

        Chat groupChat = Chat.builder()
                .isGroup(true)
                .chatName(req.chatName())
                .createdBy(reqUser)
                .admins(new HashSet<>(Set.of(reqUser)))
                .users(new HashSet<>())
                .build();

        for (UUID userId : req.userIds()) {
            User userToAdd = userService.findUserById(userId);
            groupChat.getUsers().add(userToAdd);
        }

        return chatRepository.save(groupChat);
    }

    @Override
    public Chat addUserToGroup(UUID userId, UUID chatId, User reqUser) throws UserException, ChatException {

        Chat chat = findChatById(chatId);
        User user = userService.findUserById(userId);

        if (chat.getAdmins().contains(reqUser)) {
            chat.getUsers().add(user);
            return chatRepository.save(chat);
        }

        throw new UserException("User doesn't have permissions to add members to group chat");
    }

    @Override
    public Chat renameGroup(UUID chatId, String groupName, User reqUser) throws UserException, ChatException {

        Chat chat = findChatById(chatId);

        if (chat.getAdmins().contains(reqUser)) {
            chat.setChatName(groupName);
            return chatRepository.save(chat);
        }

        throw new UserException("User doesn't have permissions to rename group chat");
    }

    @Override
    public Chat removeFromGroup(UUID chatId, UUID userId, User reqUser) throws UserException, ChatException {

        Chat chat = findChatById(chatId);
        User user = userService.findUserById(userId);

        boolean isAdminOrRemoveSelf = chat.getAdmins().contains(reqUser) ||
                (chat.getUsers().contains(reqUser) && user.getId().equals(reqUser.getId()));

        if (isAdminOrRemoveSelf) {
            chat.getUsers().remove(user);
            return chatRepository.save(chat);
        }

        throw new UserException("User doesn't have permissions to remove users from group chat");
    }

    @Override
    public void deleteChat(UUID chatId, UUID userId) throws UserException, ChatException {
    
        // 1. Tìm chat theo chatId
        Chat chat = findChatById(chatId);
    
        // 2. Tìm user thực hiện thao tác xóa theo userId
        User user = userService.findUserById(userId);
    
        // 3. Kiểm tra quyền xóa
        boolean isSingleChatOrAdmin = !chat.getIsGroup() || chat.getAdmins().contains(user);
    
        if (isSingleChatOrAdmin) {
            // Nếu là chat cá nhân hoặc user là admin của group chat
            chatRepository.deleteById(chatId);
            return;
        }
    
        // Nếu không có quyền, ném ra exception
        throw new UserException("User doesn't have permissions to delete group chat");
    }

    @Override
    public Chat markAsRead(UUID chatId, User reqUser) throws ChatException, UserException {

        // 1. Tìm chat theo chatId
        Chat chat = findChatById(chatId);

        // 2. Kiểm tra user có phải là thành viên của chat không
        if (chat.getUsers().contains(reqUser)) {
            // 3. Nếu đúng, duyệt qua tất cả các tin nhắn trong chat
            chat.getMessages().forEach(msg -> msg.getReadBy().add(reqUser.getId()));

            // 4. Lưu lại trạng thái đã đọc vào database
            return chatRepository.save(chat);
        }

        // 5. Nếu user không thuộc chat, ném ra exception
        throw new UserException("User is not related to chat");
    }

}
