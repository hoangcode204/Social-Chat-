package com.nicolas.chatapp.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Service
public class TokenProvider {
//    Sinh và kiểm tra JWT token.
//    Dùng secret key để ký và xác thực token.
//    Lấy thông tin (claims) từ token.

    private final SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(JwtConstants.SECRET_KEY));
    private final JwtParser jwtParser;

    public TokenProvider() {
//        Khởi tạo jwtParser với secret key để xác thực token.
        this.jwtParser = Jwts.parser()
                .verifyWith(key)
                .build();
    }

    public String generateToken(Authentication authentication) {
        log.info("Generating token");
        return Jwts.builder()
                .issuer(JwtConstants.ISSUER)
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + JwtConstants.ACCESS_TOKEN_VALIDITY))
                .claim(JwtConstants.EMAIL, authentication.getName())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public Claims getClaimsFromToken(String jwt) {
//        Bỏ prefix "Bearer " khỏi chuỗi token.
//                Parse token và trả về claims (payload), chứa thông tin user và các dữ liệu khác
        jwt = jwt.substring(JwtConstants.TOKEN_PREFIX.length());
        return jwtParser.parseSignedClaims(jwt).getPayload();
    }

}
