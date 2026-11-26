package com.example.demo.controller;

import com.example.demo.entity.Member;
import com.example.demo.repository.MemberRepository;
import com.example.demo.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RatingApiTest {

    private static final String RATING_REQUEST = """
            {"movieId":550,"score":4,"comment":"좋았어요"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("토큰 없이 POST /ratings를 호출하면 401과 AUTH401_2를 반환한다")
    void createRatingWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(RATING_REQUEST))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @Test
    @DisplayName("유효한 토큰으로 POST /ratings를 호출하면 201과 등록한 평점을 반환한다")
    void createRatingWithTokenReturnsCreated() throws Exception {
        Member member = memberRepository.save(Member.builder()
                .email("rating-test@example.com")
                .password("unused-test-password")
                .nickname("평점테스터")
                .build());
        String token = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());

        mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(RATING_REQUEST))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550))
                .andExpect(jsonPath("$.result.score").value(4));
    }
}
