package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umc.movie.dto.MyInfoResponse;
import com.umc.movie.dto.UpdateMyInfoRequest;
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/nickname/{nickname}")
    public NicknameCheckResponse checkNickname(
            @PathVariable("nickname") String nickname) {
        return memberService.checkNickname(nickname);
    }

    @GetMapping("/email/{email}")
    public EmailCheckResponse checkEmail(
            @PathVariable("email") String email) {
        return memberService.checkEmail(email);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request) {

        MemberResponse response = memberService.signUp(request);

        return ResponseEntity.status(201)
                .body(ApiResponse.created(
                        "회원가입에 성공했습니다.",
                        response
                ));
    }
    @GetMapping("/me")
    public ApiResponse<MyInfoResponse> getMyInfo(
            @RequestAttribute("memberId") Long memberId) {

        MyInfoResponse response = memberService.getMyInfo(memberId);

        return ApiResponse.ok("내 정보를 조회했습니다.", response);
    }
    @PatchMapping("/me")
    public ApiResponse<MyInfoResponse> updateMyInfo(
            @RequestAttribute("memberId") Long memberId,
            @Valid @RequestBody UpdateMyInfoRequest request) {

        MyInfoResponse response =
                memberService.updateMyInfo(memberId, request);

        return ApiResponse.ok("내 정보를 수정했습니다.", response);
    }
}