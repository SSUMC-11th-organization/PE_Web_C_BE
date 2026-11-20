package com.example.demo.repository;
import java.util.Optional;

import com.example.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByNickname(String nickname);

    boolean existsByEmail(String email);
    // src/main/java/com/umc/movie/repository/MemberRepository.java 에 아래 메서드를 추가합니다
    Optional<Member> findByEmail(String email);

    // src/main/java/com/umc/movie/repository/MemberRepository.java 에 아래 메서드를 추가합니다
// "이 닉네임을 쓰는 회원이 있는가? 단, 나 자신은 빼고" 를 한 번에 확인합니다
    boolean existsByNicknameAndMemberIdNot(String nickname, Long memberId);
}