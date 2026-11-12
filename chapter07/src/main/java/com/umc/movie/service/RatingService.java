package com.umc.movie.service;

import com.umc.movie.dto.RatingResponse;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import java.util.List;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.exception.ApiException;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MemberRepository memberRepository;

    public List<RatingResponse> getRatingsByMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "존재하지 않는 유저입니다."
            );
        }

        return ratingRepository
                .findByMember_MemberIdOrderByRatingIdDesc(memberId)
                .stream()
                .map(RatingResponse::from)
                .toList();
    }
    @Transactional
    public Long create(Long memberId, CreateRatingRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "존재하지 않는 유저입니다."
                ));

        boolean alreadyRated =
                ratingRepository.existsByMember_MemberIdAndMovieId(
                        memberId,
                        request.movieId()
                );

        if (alreadyRated) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "RATING409_1",
                    "이미 이 영화에 평점을 남기셨습니다."
            );
        }

        Rating rating = Rating.builder()
                .member(member)
                .movieId(request.movieId())
                .score(request.score())
                .comment(request.comment())
                .build();

        return ratingRepository.save(rating).getRatingId();
    }
    private Rating findOwnedRating(Long ratingId, Long memberId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "RATING404_1",
                        "해당 평점을 찾을 수 없습니다."
                ));

        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "RATING403_1",
                    "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."
            );
        }

        return rating;
    }
    @Transactional
    public void update(
            Long ratingId,
            Long memberId,
            UpdateRatingRequest request
    ) {
        Rating rating = findOwnedRating(ratingId, memberId);

        rating.update(request.score(), request.comment());
    }

    @Transactional
    public void delete(Long ratingId, Long memberId) {
        Rating rating = findOwnedRating(ratingId, memberId);

        ratingRepository.delete(rating);
    }
}