package com.example.demo.service;

import com.example.demo.dto.CreateRatingRequest;
import com.example.demo.dto.UpdateRatingRequest;
import com.example.demo.entity.Member;
import com.example.demo.entity.Rating;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.MemberRepository;
import com.example.demo.repository.RatingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private RatingService ratingService;

    @Test
    @DisplayName("같은 영화에 평점을 중복 등록하면 409와 RATING409_1을 반환한다")
    void duplicateRatingIsRejected() {
        long memberId = 1L;
        long movieId = 550L;
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(Member.builder().build()));
        when(ratingRepository.existsByMember_MemberIdAndMovieId(memberId, movieId)).thenReturn(true);

        ApiException error = assertThrows(ApiException.class,
                () -> ratingService.create(memberId, new CreateRatingRequest(movieId, 4, "좋았어요")));

        assertThat(error.getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(error.getCode()).isEqualTo("RATING409_1");
        verifyNoMoreInteractions(ratingRepository);
    }

    @Test
    @DisplayName("다른 회원의 평점을 수정하면 403과 RATING403_1을 반환한다")
    void updatingAnotherMembersRatingIsRejected() {
        long ratingId = 10L;
        Member owner = mock(Member.class);
        when(owner.getMemberId()).thenReturn(1L);
        Rating rating = Rating.builder().member(owner).movieId(550L).score(4).build();
        when(ratingRepository.findById(ratingId)).thenReturn(Optional.of(rating));

        ApiException error = assertThrows(ApiException.class,
                () -> ratingService.update(2L, ratingId, new UpdateRatingRequest(5, "수정")));

        assertThat(error.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(error.getCode()).isEqualTo("RATING403_1");
        assertThat(rating.getScore()).isEqualTo(4);
        verifyNoMoreInteractions(ratingRepository);
    }
}
